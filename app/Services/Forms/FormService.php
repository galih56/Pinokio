<?php

namespace App\Services\Forms;

use App\Exceptions\FormExpiredException;
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
use Vinkla\Hashids\Facades\Hashids;

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
        $encrypted_form_id = Hashids::encode($model->id);
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
                if (isset($sectionData['new_image']) && $sectionData['new_image'] instanceof \Illuminate\Http\UploadedFile) {
                    try {
                        $sectionImagePath = app(FileService::class)->uploadImage(
                            $sectionData['new_image'], 
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
                } elseif (isset($sectionData['new_image']) && is_string($sectionData['new_image'])) {
                    // Keep existing URL if it's a string
                    $sectionImagePath = $sectionData['new_image'];
                }
                $section = FormSection::updateOrCreate(
                    ['id' => $sectionData['id']], 
                    [
                        'form_id' => $model->id, 
                        'label' => $sectionData['label'], 
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
                    if (isset($fieldData['new_image']) && $fieldData['new_image'] instanceof \Illuminate\Http\UploadedFile) {
                        try {
                            $fieldImagePath = app(FileService::class)->uploadImage(
                                $fieldData['new_image'],
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
                    } elseif (isset($fieldData['new_image']) && is_string($fieldData['new_image'])) {
                        // Keep existing URL if it's a string
                        $fieldImagePath = $fieldData['new_image'];
                    }

                    $field = FormField::updateOrCreate(
                        ['id' => $fieldData['id']], 
                        [
                            'form_section_id' => $section->id, 
                            'label' => $fieldData['label'],
                            'placeholder' => $fieldData['placeholder'] ?? null,
                            'is_required' => $fieldData['is_required'] ?? false,
                            'order' => $fieldOrder++,
                            'field_type_id' => FieldType::resolveFieldType($fieldData['type']),
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
    
    /**
     * Delete a form.
     */
    public function delete(int $id)
    {
        DB::transaction(function () use ($id) {
            $form = Form::with([
                'sections.fields.options',
                'sections.fields',
                'sections'
            ])->findOrFail($id);

            // Delete options
            foreach ($form->sections as $section) {
                foreach ($section->fields as $field) {
                    $field->options()->delete();
                }
                // Delete fields
                $section->fields()->delete();
            }

            // Delete sections
            $form->sections()->delete();

            // Finally, delete the form
            $form->delete();
        });
    }

    public function getFormWithLayout(int $id){
        return Form::with([
            'sections.fields.options',
            'sections.fields.fieldType',
        ])->findOrFail($id);
    }

    public function getFormEntryLayout(int $id)
    {
        $form = Form::with('tokens') // if needed
            ->findOrFail($id);

        // We'll always return basic form info, but track if it's expired
        $isExpired = false;

        // Check form expiry
        if ($form->expires_at && $form->expires_at->isPast()) {
            $isExpired = true;
        }

        // Token check
        if ($form->requires_token) {
            $tokenValue = request('token'); // from query or header
            $token = FormToken::where('form_id', $form->id)
                ->where('token', $tokenValue)
                ->firstOrFail();

            if ($token->expires_at && $token->expires_at->isPast()) {
                $isExpired = true;
            }

            if ($form->time_limit && $token->open_time) {
                $expiryTime = $token->open_time->copy()->addSeconds($form->time_limit);
                if (now()->greaterThan($expiryTime)) {
                    $isExpired = true;
                }
            }
        }

        // Fetch layout *after* checks (if you want to use it regardless)
        $form->load([
            'sections.fields.options',
            'sections.fields.fieldType',
        ]);

        // Throw after load, so the frontend gets partial form data
        if ($isExpired) {
            throw new FormExpiredException('Form has expired');
        }

        return $form;
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
    
    public function generateId($prefix = '', $length = 8)
    {
        return $prefix . bin2hex(random_bytes($length / 2));
    }

}
