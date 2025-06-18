<?php

namespace App\Http\Requests\Form;

use App\Services\Forms\FormService;

class StoreFormSubmissionRequest extends FormRequest
{
    public function rules(): array
    {
        $form = app(FormService::class)->getFormWithLayout($this->route('form_id'));
        
        $rules = [];

        foreach ($form->sections as $section) {
            foreach ($section->fields as $field) {
                $fieldRules = [];

                if ($field->is_required) {
                    $fieldRules[] = 'required';
                } else {
                    $fieldRules[] = 'nullable';
                }

                // Based on field type
                switch ($field->fieldType->name) {
                    case 'checkbox':
                        $fieldRules[] = 'array';
                        break;
                    case 'email':
                        $fieldRules[] = 'email';
                        break;
                    case 'number':
                        $fieldRules[] = 'numeric';
                        break;
                    case 'date':
                        $fieldRules[] = 'date';
                        break;
                    case 'file':
                        $fieldRules[] = 'file';
                        $fieldRules[] = 'max:5120';
                        $fieldRules[] = 'mimes:jpeg,png,jpg,gif,webp,pdf,docx'; // example
                        break;
                    case 'select':
                    case 'radio':
                        $validOptions = $field->options->pluck('value')->toArray();
                        $fieldRules[] = Rule::in($validOptions);
                        break;
                }

                $rules[$field->id] = $fieldRules;
            }
        }

        return $rules;
    }
}