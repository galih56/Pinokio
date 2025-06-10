<?php

namespace App\Http\Requests\Form;

use Illuminate\Validation\Rule;
use App\Http\Requests\BaseRequest;

class UpdateFormLayoutRequest extends BaseRequest
{
    public function authorize(): bool
    {
        return auth()->check();
    }

    protected function prepareForValidation()
    {

    }
    
    public function rules(): array
    {
        return [
            // Basic form information
            'title' => ['required', 'string', 'min:1', 'max:255'],
            'description' => ['nullable', 'string'],

            // Sections array
            'sections' => ['required', 'array'],
            'sections.*.id' => ['required', 'string'],
            'sections.*.name' => ['required', 'string', 'max:255'],
            'sections.*.description' => ['nullable', 'string'],
            'sections.*.image' =>  ['nullable', 'file', 'mimes:jpeg,png,jpg,gif,webp', 'max:5120'],

            // Fields within sections
            'sections.*.fields' => ['required', 'array'],
            'sections.*.fields.*.id' => ['required', 'string'],
            'sections.*.fields.*.type' => [
                'required',
                Rule::in(['text', 'email', 'tel', 'number', 'date', 'url', 'textarea', 'select', 'radio', 'checkbox'])
            ],
            'sections.*.fields.*.label' => ['required', 'string', 'max:255'],
            'sections.*.fields.*.placeholder' => ['nullable', 'string', 'max:255'],
            'sections.*.fields.*.required' => ['sometimes', 'boolean'],
            'sections.*.fields.*.options' => ['nullable', 'array'],
            'sections.*.fields.*.options.*' => ['required_with:sections.*.fields.*.options', 'string', 'max:255'],
            'sections.*.fields.*.min' => ['nullable', 'integer', 'min:0'],
            'sections.*.fields.*.max' => ['nullable', 'integer', 'min:0'],
            'sections.*.fields.*.rows' => ['nullable', 'integer', 'min:1', 'max:20'],
            'sections.*.fields.*.image' => ['nullable', 'file', 'mimes:jpeg,png,jpg,gif,webp', 'max:5120'],
            'sections.*.fields.*.defaultValue' => ['nullable', 'string'],
        ];
    }

    public function withValidator($validator): void
    {
        $validator->after(function ($validator) {
            $sections = $this->input('sections', []);
            
            foreach ($sections as $sectionIndex => $section) {
                $fields = $section['fields'] ?? [];
                
                foreach ($fields as $fieldIndex => $field) {
                    $fieldType = $field['type'] ?? '';
                    
                    // Validate that select, radio, checkbox fields have options
                    if (in_array($fieldType, ['select', 'radio', 'checkbox'])) {
                        $options = $field['options'] ?? [];
                        if (empty($options)) {
                            $validator->errors()->add(
                                "sections.{$sectionIndex}.fields.{$fieldIndex}.options",
                                "Options are required for {$fieldType} fields."
                            );
                        }
                    }
                    
                    // Validate min/max for number fields
                    if ($fieldType === 'number') {
                        $min = $field['min'] ?? null;
                        $max = $field['max'] ?? null;
                        
                        if ($min !== null && $max !== null && $min > $max) {
                            $validator->errors()->add(
                                "sections.{$sectionIndex}.fields.{$fieldIndex}.max",
                                "Maximum value must be greater than minimum value."
                            );
                        }
                    }
                    
                    // Validate rows for textarea fields
                    if ($fieldType === 'textarea') {
                        $rows = $field['rows'] ?? null;
                        if ($rows !== null && ($rows < 1 || $rows > 20)) {
                            $validator->errors()->add(
                                "sections.{$sectionIndex}.fields.{$fieldIndex}.rows",
                                "Textarea rows must be between 1 and 20."
                            );
                        }
                    }
                }
            }
        });
    }

    public function messages(): array
    {
        return [
            'title.required' => 'Form title is required.',
            'title.min' => 'Form title cannot be empty.',
            'sections.required' => 'At least one section is required.',
            'sections.*.id.required' => 'Section ID is required.',
            'sections.*.name.required' => 'Section name is required.',
            'sections.*.fields.required' => 'Each section must have at least one field.',
            'sections.*.fields.*.id.required' => 'Field ID is required.',
            'sections.*.fields.*.type.required' => 'Field type is required.',
            'sections.*.fields.*.type.in' => 'Invalid field type selected.',
            'sections.*.fields.*.label.required' => 'Field label is required.',
            'sections.*.fields.*.required.required' => 'Field required status must be specified.',
            'sections.*.fields.*.options.*.required_with' => 'Option value cannot be empty.',
            'sections.*.fields.*.min.min' => 'Minimum value cannot be negative.',
            'sections.*.fields.*.max.min' => 'Maximum value cannot be negative.',
            'sections.*.fields.*.rows.min' => 'Textarea must have at least 1 row.',
            'sections.*.fields.*.rows.max' => 'Textarea cannot have more than 20 rows.',
            'sections.*.image.url' => 'Section image must be a valid URL.',
            'sections.*.fields.*.image.file' => 'Image file type is invalid',
            'sections.*.fields.*.image.max' => 'Image file size must less than 5MB',
        ];
    }
}