<?php

namespace App\Services\Forms;

use Illuminate\Database\Eloquent\Collection;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;
use App\Helpers\QueryProcessor;
use App\Models\Forms\FieldType;
use App\Models\Forms\Form;
use App\Models\Forms\FormField;
use App\Models\Forms\FormFieldOption;
use App\Models\Forms\FormSection;
use App\Models\Forms\FormToken;
use App\Models\Forms\FormAttempt;
use App\Models\Forms\FormSubmission;
use App\Models\Forms\FormEntry;


use Illuminate\Support\Str;
use App\Services\FileService;
use App\Services\HashIdService;

class FormService
{
    protected Form $model;

    protected $fileService;

    public function __construct(
        Form $model,
        FileService $fileService, 
    )
    {
        $this->model = $model;
        $this->fileService = $fileService;
    }

    public function getRelatedData()
    {
        return [ 
            'tokens',
            'attempts',
            'templates'
        ];
    }

    public function get(array $filters = [], int $perPage = 0, array $sorts = []): Collection | LengthAwarePaginator
    {
        $query = $this->model->newQuery();

        $query = QueryProcessor::applyFilters($query, $filters);
        $query = QueryProcessor::applySorts($query, $sorts);

        return $perPage ? $query->paginate($perPage) : $query->get();
    }

    public function getById(int $id): ?Form
    {
        $this->model = Form::findOrFail($id);
        return $this->model;
    }

    /**
     * Create a new form.
     */
    public function create(array $data): Form
    {
        if (isset($data['form_url'])) {
            $data['form_code'] = $this->extractGoogleFormCode($data['form_url']);
        }

        $this->model = $this->model->create($data);
        return $this->model;
    }

    /**
     * Update an existing form.
     */
    public function update(int $id, array $data): Form
    {
        $model = $this->model->find($id);
        $model->update($data);
        return $model;
    }

    public function updateFormLayout(int $id, array $data)
    {
        $model = $this->model->find($id);
        $encrypted_form_id = app(HashIdService::class)->encode($model->id);
        $prefix_image_path = "forms/$encrypted_form_id";

        DB::transaction(function () use ($data, $model, $prefix_image_path) {
            $model->update([
                'title' => $data['title'],
                'description' => $data['description'] ?? null,
            ]);

            $sectionIds = [];
            $sectionOrder = 0;

            foreach ($data['sections'] as $sectionData) {
                // Handle section image upload
                $sectionImagePath = null;
                if (isset($sectionData['image']) && $sectionData['image'] instanceof \Illuminate\Http\UploadedFile) {
                    try {
                        $sectionImagePath = app(FileService::class)->uploadImage(
                            $sectionData['image'], 
                            $prefix_image_path."/".$sectionData['id'],
                            auth()->user(),
                            null,
                            false
                        );
                    } catch (\Exception $e) {
                        // Log error or handle as needed
                        \Log::error('Section image upload failed: ' . $e->getMessage());
                        // You might want to throw the exception or handle it gracefully
                    }
                } elseif (isset($sectionData['image']) && is_string($sectionData['image'])) {
                    // Keep existing URL if it's a string
                    $sectionImagePath = $sectionData['image'];
                }

                $section = FormSection::updateOrCreate(
                    ['id' => $sectionData['id']], 
                    [
                        'form_id' => $model->id, 
                        'description' => $sectionData['description'] ?? null,
                        'order' => $sectionOrder++,
                        'image_path' => $sectionImagePath,
                    ]
                );

                $sectionIds[] = $section->id;
                $fieldIds = [];
                $fieldOrder = 0;

                foreach ($sectionData['fields'] as $fieldData) {
                    // Handle field image upload
                    $fieldImagePath = null;
                    if (isset($fieldData['image']) && $fieldData['image'] instanceof \Illuminate\Http\UploadedFile) {
                        try {
                            $fieldImagePath = app(FileService::class)->uploadImage(
                                $fieldData['image'],
                                $prefix_image_path."/".$sectionData['id'],
                                auth()->user(),
                                null,
                                false
                            );
                        } catch (\Exception $e) {
                            // Log error or handle as needed
                            \Log::error('Field image upload failed: ' . $e->getMessage());
                            // You might want to throw the exception or handle it gracefully
                        }
                    } elseif (isset($fieldData['image']) && is_string($fieldData['image'])) {
                        // Keep existing URL if it's a string
                        $fieldImagePath = $fieldData['image'];
                    }

                    $field = FormField::updateOrCreate(
                        ['id' => $fieldData['id']], 
                        [
                            'form_section_id' => $section->id, 
                            'label' => $fieldData['label'],
                            'placeholder' => $fieldData['placeholder'] ?? null,
                            'is_required' => $fieldData['is_required'] ?? false,
                            'order' => $fieldOrder++,
                            'field_type_id' => $this->resolveFieldTypeId($fieldData['type']),
                            'min' => $fieldData['min'] ?? null,
                            'max' => $fieldData['max'] ?? null,
                            'rows' => $fieldData['rows'] ?? null,
                            'image_path' => $fieldImagePath,
                            'default_value' => $fieldData['defaultValue'] ?? null,
                        ]
                    );

                    $fieldIds[] = $field->id;

                    $selectableTypes = ['select', 'radio', 'checkbox'];
                    if (in_array($fieldData['type'], $selectableTypes)) {
                        // Get existing option IDs to determine what to keep/delete
                        $existingOptionIds = $field->options()->pluck('id')->toArray();
                        $newOptionIds = [];
                        
                        foreach ($fieldData['options'] ?? [] as $optionData) {
                            $option = FormFieldOption::updateOrCreate(
                                ['id' => $optionData['id']], // Assuming client sends option IDs
                                [
                                    'form_field_id' => $field->id,
                                    'label' => $optionData['label'],
                                    'value' => $optionData['value'] ?? \Str::slug($optionData['label']),
                                ]
                            );
                            $newOptionIds[] = $option->id;
                        }
                        
                        // Delete options that are no longer present
                        FormFieldOption::where('form_field_id', $field->id)
                                    ->whereNotIn('id', $newOptionIds)
                                    ->delete();
                    }
                }

                // Clean up orphaned fields
                FormField::where('form_section_id', $section->id)
                        ->whereNotIn('id', $fieldIds)
                        ->delete();
            }

            // Clean up orphaned sections
            FormSection::where('form_id', $model->id)
                    ->whereNotIn('id', $sectionIds)
                    ->delete();
        });
    }

    private function generateUniqueFieldName(string $baseName, array $usedNames): string
    {
        if (!in_array($baseName, $usedNames)) {
            return $baseName;
        }
        
        $counter = 1;
        while (in_array($baseName . '_' . $counter, $usedNames)) {
            $counter++;
        }
        
        return $baseName . '_' . $counter;
    }
    
    /**
     * Delete a form.
     */
    public function delete(int $id): bool
    {
        $model = $this->model->find($id);
        return $model->delete();
    }

    public function getFormWithLayout(int $id){
        return Form::with([
            'sections.fields.options',
            'sections.fields.fieldType',
        ])->findOrFail($id);
    }

    public function generateToken(Form $form, array $data): string
    {
        $token = Str::random(32);

        FormToken::create([
            'form_id'    => $form->id,
            'token'      => $token,
            'identifier' => $data['identifier'] ?? null,
            'expires_at' => isset($data['expires_at']) 
                ? now()->parse($data['expires_at']) 
                : now()->addDays(1), // fallback
        ]);

        return $token;
    }

    public function triggerOpenTime(string $token): ?FormToken
    {
        $formToken = FormToken::where('token', $token)->firstOrFail();

        if (!$formToken->open_time) {
            $formToken->update(['open_time' => now()]);
        }

        return $formToken;
    }

    protected function extractGoogleFormCode(?string $url): ?string
    {
        if (!$url) return null;

        preg_match('#/forms/d/e/([^/]+)/#', $url, $matches);

        if (!isset($matches[1])) {
            logger()->warning('Failed to extract Google Form code', ['url' => $url]);
            return null;
        }

        return $matches[1];
    }
    
    protected function resolveFieldTypeId(string $type): int
    {
        return FieldType::where('name', $type)->value('id')
            ?? throw new \RuntimeException("Invalid field type: {$type}");
    }

    public function getFormResponses(int $formId, array $filters = [])
    {
        $query = FormSubmission::with([
            'form:id,title,description',
            'submittedByUser:id,name,email',
            'entries.formField:id,label,field_type_id',
            'entries.formField.fieldType:id,name',
            'entries.formField.options:id,form_field_id,label,value'
        ])->where('form_id', $formId);
            
        if (isset($filters['user_id'])) {
            $query->where('submitted_by', $filters['user_id']);
        }

        if (isset($filters['date_from'])) {
            $query->where('submitted_at', '>=', $filters['date_from']);
        }

        if (isset($filters['date_to'])) {
            $query->where('submitted_at', '<=', $filters['date_to']);
        }

        if (isset($filters['identifier'])) {
            $query->whereHas('attempts', function($q) use ($filters) {
                $q->where('identifier', $filters['identifier']);
            });
        }

        return $query->orderBy('submitted_at', 'desc')->get();
    }

    public function storeFormResponse(int $formId, array $responseData, ?string $token = null, ?string $identifier = null)
    {
        // Get the form with all its structure for validation (using your existing method)
        $form = $this->getFormWithLayout($formId);

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
