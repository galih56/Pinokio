<?php

namespace App\Services\Forms;

use App\Helpers\QueryProcessor;
use App\Models\Forms\Form;
use App\Models\Forms\FormAttempt;
use App\Models\Forms\FormEntry;
use App\Models\Forms\FormSubmission;
use App\Models\Forms\FormToken;
use App\Services\FileService;
use App\Services\HashIdService;
use App\Exports\FormResponseExport;
use DB;

class FormResponseService
{
    protected Form $model;

    protected $fileService;
    protected $formService;

    public function __construct(
        Form $model,
        FileService $fileService, 
        FormService $formService, 
    )
    {
        $this->model = $model;
        $this->fileService = $fileService;
        $this->formService = $formService;
    }

    
    public function get(int $formId, array $filters = [], int $perPage = 0, array $sorts= [])
    {
        $query = FormSubmission::with([
            'form:id,title,description',
            // 'submittedByUser:id,name,email',
            'entries.formField:id,label,field_type_id',
            'entries.formField.fieldType:id,name',
            'entries.formField.options:id,form_field_id,label,value'
        ])->where('form_id', $formId);
        
        $query = QueryProcessor::applyFilters($query, $filters);
        $query = QueryProcessor::applySorts($query, $sorts);
        $query = $query->orderBy('submitted_at', 'desc');

        if($perPage){
            return $query->paginate($perPage);
        }

        return $query->get();
    }

    public function export(int $formId) : FormResponseExport
    {
        $this->model = Form::findOrFail($formId);
        $submissions = $this->get($formId);
        return new FormResponseExport($submissions);
    }

    public function store(int $formId, array $responseData, ?string $token = null, ?string $identifier = null)
    {
        // Get the form with all its structure for validation (using your existing method)
        $form = $this->formService->getFormWithLayout($formId);

        // Get all fields from all sections using flatMap like in your original code
        $allFields = $form->sections->flatMap->fields;
        
        return DB::transaction(function () use ($formId, $form, $responseData, $allFields, $token, $identifier) {
            
            // Handle form attempt tracking
            $attempt = null;
            $tokenRecord = null;
            
            if ($token) {
                $tokenRecord = FormToken::where('token', $token)
                    ->where('form_id', $formId)
                    ->where('is_used', false)
                    ->first();
                    
                if (!$tokenRecord) {
                    throw new \Exception('Invalid or expired token');
                }
                
                if ($tokenRecord->expires_at && $tokenRecord->expires_at < now()) {
                    throw new \Exception('Token has expired');
                }
            }

            // Create form attempt
            $attempt = FormAttempt::create([
                'form_id' => $formId,
                'token_id' => $tokenRecord?->id,
                'identifier' => $identifier ?? $tokenRecord?->identifier,
                'started_at' => $responseData['started_at'] ?? now(),
                'submitted_at' => now(),
                'is_valid' => true,
                'duration_seconds' => isset($responseData['started_at']) 
                    ? now()->diffInSeconds($responseData['started_at']) 
                    : null,
            ]);

            // Create the form submission
            $formSubmission = FormSubmission::create([
                'form_id' => $formId,
                'submitted_by' => auth()->id(),
                'submitted_at' => now(),
            ]);

            $entryIds = [];

            // Process each field response directly from responseData
            foreach ($responseData as $fieldName => $value) {
                // Skip meta fields like started_at, token, etc.
                if (in_array($fieldName, ['started_at', 'token', 'identifier'])) {
                    continue;
                }

                // Find the corresponding field
                $field = $allFields->firstWhere('id', $fieldName);

                if (!$field) {
                    continue; // Skip unknown fields
                }

                // Validate required fields
                if ($field->is_required && (is_null($value) || $value === '')) {
                    throw new \Exception("Field '{$field->label}' is required");
                }

                // Process the field value based on field type
                $processedValue = $this->processFieldValue($field, $value, $formId, $formSubmission->id);

                // Create form entry
                $entry = FormEntry::create([
                    'form_submission_id' => $formSubmission->id,
                    'form_field_id' => $field->id,
                    'value' => is_array($processedValue) ? json_encode($processedValue) : $processedValue,
                ]);

                $entryIds[] = $entry->id;
            }

            // Validate all required fields are present
            $requiredFields = $allFields->where('is_required', true);
            $submittedFieldIDs = array_keys($responseData);
            
            foreach ($requiredFields as $requiredField) {
                if (!in_array($requiredField->id, $submittedFieldIDs)) {
                    throw new \Exception("Required field '{$requiredField->label}' is missing");
                }
            }

            // Mark token as used if applicable
            if ($tokenRecord) {
                $tokenRecord->update([
                    'submitted_time' => now(),
                    'is_used' => true,
                ]);
            }

            // Load and return the submission with all relations
            return $formSubmission->load([
                'entries.formField:id,label,field_type_id',
                'entries.formField.fieldType:id,name', 
                'entries.formField.options:id,form_field_id,label,value', 
                'form:id,title',
                'submittedByUser:id,name,email'
            ]);
        });
    }



    private function processFieldValue($field, $value, $formId, $submissionId = null)
    {
        switch ($field->fieldType->name) {
            case 'checkbox':
                // Handle multiple checkbox values
                return is_array($value) ? $value : [$value];
                
            case 'select':
            case 'radio':
                // Validate that the value exists in options
                $validOptions = $field->options->pluck('value')->toArray();
                if (!in_array($value, $validOptions)) {
                    throw new \Exception("Invalid option selected for field '{$field->label}'");
                }
                return $value;
                
            case 'file':
                // Handle file upload
                if ($value instanceof \Illuminate\Http\UploadedFile) {
                    $encrypted_form_id = app(HashIdService::class)->encode($formId);
                    $prefix_path = "form_responses/$encrypted_form_id/$submissionId";
                    
                    try {
                        return app(FileService::class)->uploadFile(
                            $value,
                            $prefix_path,
                            auth()->user(),
                            null,
                            false
                        );
                    } catch (\Exception $e) {
                        \Log::error('Form response file upload failed: ' . $e->getMessage());
                        throw new \Exception("Failed to upload file for field '{$field->label}'");
                    }
                }
                return $value;
                
            case 'number':
                // Validate numeric value
                if (!is_numeric($value)) {
                    throw new \Exception("Field '{$field->label}' must be a number");
                }
                return (float) $value;
                
            case 'email':
                // Validate email format
                if (!filter_var($value, FILTER_VALIDATE_EMAIL)) {
                    throw new \Exception("Field '{$field->label}' must be a valid email address");
                }
                return $value;
                
            case 'date':
                // Ensure proper date format
                try {
                    return \Carbon\Carbon::parse($value)->format('Y-m-d');
                } catch (\Exception $e) {
                    throw new \Exception("Field '{$field->label}' must be a valid date");
                }
                
            case 'datetime':
                // Ensure proper datetime format
                try {
                    return \Carbon\Carbon::parse($value)->format('Y-m-d H:i:s');
                } catch (\Exception $e) {
                    throw new \Exception("Field '{$field->label}' must be a valid datetime");
                }
                
            default:
                return $value;
        }
    }
}

