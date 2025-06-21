<?php

namespace Database\Seeders;

use App\Models\Forms\FieldType;
use App\Models\Forms\Form;
use App\Models\Forms\FormField;
use App\Models\Forms\FormFieldOption;
use App\Models\Forms\FormSection;
use App\Services\FileService;
use App\Services\Forms\FormService;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Storage;
use Vinkla\Hashids\Facades\Hashids;

class FormSamplesSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $formService = app(FormService::class);
        $fileService = app(FileService::class);

        // Remove all forms
        $forms = $formService->get();
        foreach ($forms as $i => $form) {
            $formService->delete($form->id);
        }        

        // Load JSON file (correct path, no leading slash!)
        $raw = Storage::disk('local')->get('/form_presets/form_samples.json');
        $data = json_decode($raw, true);
        $forms = $data['data'];

        foreach ($forms as $i => $formData) {
            $form = Form::create([
                'title' => $formData['title'],
                'proctored' => $formData['proctored'],
                'time_limit' => $formData['time_limit'],
                'expires_at' => $formData['expires_at'],
                'requires_token' => $formData['requires_token'],
                'description' => $formData['description'] ?? null,
            ]);

            $encrypted_form_id = Hashids::encode($form->id);
            $prefix_image_path = "forms/$encrypted_form_id";

            $sectionOrder = 0;

            foreach ($formData['sections'] as $sectionData) {

                // Assign section ID if needed
                $sectionData['id'] = $formService->generateId('section');

                // Handle section image upload (if needed)
                $sectionImagePath = null;
                if (isset($sectionData['new_image'])) {
                    $sectionImagePath = $fileService->copyFile(
                        $sectionData['new_image'],
                        "$prefix_image_path/{$sectionData['id']}",
                        'local',
                        'public'
                    );
                }

                $section = FormSection::create([
                    'id' => $sectionData['id'],
                    'form_id' => $form->id,
                    'label' => $sectionData['label'],
                    'description' => $sectionData['description'] ?? null,
                    'order' => $sectionOrder++,
                    'image_path' => $sectionImagePath,
                ]);

                $fieldOrder = 0;

                foreach ($sectionData['fields'] as $fieldData) {

                    // Assign field ID if needed
                    $fieldData['id'] = $formService->generateId('field');

                    // Handle field image
                    $fieldImagePath = null;
                    if (isset($fieldData['new_image'])) {
                        $fieldImagePath = $fileService->copyFile(
                            $fieldData['new_image'],
                            "$prefix_image_path/{$fieldData['id']}",
                            'local',
                            'public'
                        );
                    }

                    $field = FormField::create([
                        'id' => $fieldData['id'],
                        'form_section_id' => $section->id,
                        'label' => $fieldData['label'],
                        'placeholder' => $fieldData['placeholder'] ?? null,
                        'is_required' => $fieldData['is_required'] ?? false,
                        'order' => $fieldOrder++,
                        'field_type_id' => FieldType::resolveFieldType($fieldData['type']),
                        'min' => $fieldData['min'] ?? null,
                        'max' => $fieldData['max'] ?? null,
                        'image_path' => $fieldImagePath,
                        'default_value' => $fieldData['defaultValue'] ?? null,
                    ]);

                    if (in_array($fieldData['type'], ['select', 'radio', 'checkbox'])) {
                        foreach ($fieldData['options'] ?? [] as $optionData) {

                            // Assign option ID if needed
                            $optionData['id'] = $formService->generateId('option');

                            FormFieldOption::create([
                                'id' => $optionData['id'],
                                'form_field_id' => $field->id,
                                'label' => $optionData['label'],
                                'value' => $optionData['value'] ?? \Str::slug($optionData['label']),
                            ]);
                        }
                    }
                }
            }
        }
    }


}
