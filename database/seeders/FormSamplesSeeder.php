<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Storage;

class FormSamplesSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $formService = app(\App\Services\Form\FormService::class);

        // Load JSON file
        $raw = Storage::get('form_presets/testing_pinokio.json');
        $formLayout = json_decode($raw, true);

        // Assign generated IDs
        foreach ($formLayout['sections'] as &$section) {
            $section['id'] = $formService->generateId('section');

            foreach ($section['fields'] as &$field) {
                $field['id'] = $formService->generateId('field');

                if (in_array($field['type'], ['select', 'radio', 'checkbox'])) {
                    foreach ($field['options'] as &$option) {
                        $option['id'] = $formService->generateId('option');
                        $option['value'] = $option['id']; // optional, or you can slug the label
                    }
                }
            }
        }
        unset($section, $field, $option);
    }
}
