<?php

namespace App\Http\Requests\Form;

use Illuminate\Validation\Rule;
use App\Http\Requests\BaseRequest;

class UpdateFormRequest extends BaseRequest
{
    public function authorize(): bool
    {
        return auth()->check();
    }

    protected function prepareForValidation()
    {
        if ($this->has('form_url')) {
            $this->merge([
                'form_url' => strtolower($this->input('form_url'))
            ]);
        }
        
        $booleanFields = [
            'allow_multiple_attempts',
            'proctored',
            'requires_token',
            'requires_identifier',
            'is_active',
        ];

        foreach ($booleanFields as $field) {
            $this->merge([
                $field => $this->boolean($field),
            ]);
        }


        // Auto-set requires_token and requires_identifier for Google Forms
        if ($this->input('provider') === 'Google Form' && $this->boolean('proctored')) {
            $this->merge([
                'requires_token' => true,
                'requires_identifier' => true,
            ]);
        }
    }
    
    public function rules(): array
    {
        $isGoogleForm = $this->input('provider') === 'Google Form';
        $isPinokio = $this->input('provider') === 'Pinokio';
        $isProctored = $this->boolean('proctored');
        $requiresIdentifier = $this->boolean('requires_identifier');

        return [
            'title' => ['sometimes', 'string', 'max:255'],
            'description' => ['nullable', 'string'],

            'provider' => ['required', Rule::in(['Pinokio', 'Google Form'])],
            'form_code' => [
                'nullable', 
                'string',
                Rule::unique('forms', 'form_code')->ignore($this->route('form')),
            ],

            'form_url' => [
                Rule::requiredIf($isGoogleForm),
                'nullable',
                'url',
            ],
            
            'expires_at' => ['nullable', 'date'],

            // Proctoring related fields
            'proctored' => ['required', 'boolean'],
            'requires_token' => ['nullable', 'boolean'],
            'requires_identifier' => ['nullable', 'boolean'],

            // Identifier fields - required for Google Forms or when requires_identifier is true for Pinokio
            'identifier_label' => [
                Rule::requiredIf(function () use ($isGoogleForm, $isPinokio, $requiresIdentifier, $isProctored) {
                    return ($isGoogleForm && $isProctored) || ($isPinokio && $requiresIdentifier && $isProctored);
                }),
                'nullable',
                'string',
                'max:255',
            ],
            
            'identifier_description' => ['nullable', 'string'],
            
            'identifier_type' => [
                Rule::requiredIf(function () use ($isGoogleForm, $isPinokio, $requiresIdentifier, $isProctored) {
                    return ($isGoogleForm && $isProctored) || ($isPinokio && $requiresIdentifier && $isProctored);
                }),
                'nullable',
                Rule::in(['text', 'email', 'number']),
            ],

            // Time limit - only required when proctored
            'time_limit' => [
                Rule::requiredIf($isProctored),
                'nullable',
                'integer',
                'min:60', // Minimum 1 minute
                'max:86400', // Maximum 24 hours
            ],

            'allow_multiple_attempts' => ['required', 'boolean'],
            'is_active' => ['nullable', 'boolean'],
        ];
    }

    public function withValidator($validator): void
    {
        $validator->after(function ($validator) {
            $provider = $this->input('provider');
            $isProctored = $this->boolean('proctored');
            
            // Validate Google Form URL
            if ($provider === 'Google Form') {
                $url = $this->input('form_url');
                if ($url && !str_contains($url, 'docs.google.com/forms')) {
                    $validator->errors()->add('form_url', 'The form_url must be a valid Google Form link.');
                }

                // Ensure requires_token and requires_identifier are true for Google Forms when proctored
                if ($isProctored && (!$this->boolean('requires_token') || !$this->boolean('requires_identifier'))) {
                    $validator->errors()->add('proctored', 'Google Forms require both token and identifier when proctoring is enabled.');
                }
            }

            // Validate that identifier fields are filled when requires_identifier is true
            if ($this->boolean('requires_identifier') && $isProctored) {
                if (empty($this->input('identifier_label'))) {
                    $validator->errors()->add('identifier_label', 'Identifier label is required when identifier is enabled.');
                }
                if (empty($this->input('identifier_type'))) {
                    $validator->errors()->add('identifier_type', 'Identifier type is required when identifier is enabled.');
                }
            }
        });
    }

    public function messages(): array
    {
        return [
            'form_url.required' => 'Google Form URL is required when using Google Forms.',
            'identifier_label.required' => 'Identifier label is required for the selected configuration.',
            'identifier_type.required' => 'Identifier type is required for the selected configuration.',
            'time_limit.required' => 'Time limit is required when proctoring is enabled.',
            'time_limit.min' => 'Time limit must be at least 1 minute.',
            'time_limit.max' => 'Time limit cannot exceed 24 hours.',
        ];
    }
}
