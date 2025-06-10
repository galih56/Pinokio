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
use Illuminate\Support\Str;

class FormService
{
    protected Form $model;

    public function getRelatedData()
    {
        return [ 
            'tokens',
            'attempts',
            'templates'
        ];
    }
    
    public function __construct(
        Form $model,
    )
    {
        $this->model = $model;
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
            
        DB::transaction(function () use ($data, $model) {
            $model->update([
                'title' => $data['title'],
                'description' => $data['description'] ?? null,
            ]);

            $sectionIds = [];
            $sectionOrder = 0;
            $usedFieldNames = []; // Track field names across all sections

            foreach ($data['sections'] as $sectionData) {
                $section = FormSection::updateOrCreate(
                    ['id' => $sectionData['id']], // Remove form_id from unique constraint
                    [
                        'form_id' => $model->id, // Set form_id in the data array
                        'name' => $sectionData['name'],
                        'description' => $sectionData['description'] ?? null,
                        'order' => $sectionOrder++,
                        'image_url' => $sectionData['image'] ?? null,
                    ]
                );

                $sectionIds[] = $section->id;
                $fieldIds = [];
                $fieldOrder = 0;

                foreach ($sectionData['fields'] as $fieldData) {
                    // Generate unique field name
                    $baseFieldName = \Str::slug($fieldData['label'], '_');
                    $uniqueFieldName = $this->generateUniqueFieldName($baseFieldName, $usedFieldNames);
                    $usedFieldNames[] = $uniqueFieldName;

                    $field = FormField::updateOrCreate(
                        ['id' => $fieldData['id']], // Remove form_section_id from unique constraint
                        [
                            'form_section_id' => $section->id, // Set form_section_id in the data array
                            'label' => $fieldData['label'],
                            'name' => $uniqueFieldName,
                            'placeholder' => $fieldData['placeholder'] ?? null,
                            'is_required' => $fieldData['required'] ?? false,
                            'order' => $fieldOrder++,
                            'field_type_id' => $this->resolveFieldTypeId($fieldData['type']),
                            'min' => $fieldData['min'] ?? null,
                            'max' => $fieldData['max'] ?? null,
                            'rows' => $fieldData['rows'] ?? null,
                            'image_url' => $fieldData['image'] ?? null,
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
}
