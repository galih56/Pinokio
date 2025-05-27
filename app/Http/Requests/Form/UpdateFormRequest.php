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
        $this->merge([
            'allow_multiple_attempts' => $this->boolean('allow_multiple_attempts'),
            'proctored' => $this->boolean('proctored'),
            'is_active' => $this->boolean('is_active'),
        ]);
    }
    
    public function rules(): array
    {
        return [
            'title' => ['required', 'string'],
            'description' => ['nullable', 'string'],
            'provider' => ['required', Rule::in(['Pinokio', 'Google Form'])],
            'form_code' => ['nullable', 'string'],
            'form_url' => ['nullable', 'url'],
            
            'access_type' => ['required', Rule::in(['public', 'token', 'identifier'])],
            'identifier_label' => [
                Rule::requiredIf(fn () => $this->input('access_type') === 'identifier'),
                'nullable', 'string',
            ],
            'identifier_description' => ['nullable', 'string'],
            'identifier_type' => [
                Rule::requiredIf(fn () => $this->input('access_type') === 'identifier'),
                Rule::in(['Free Text', 'Email', 'Number']),
            ],

            'time_limit' => ['required', 'integer'],
            'allow_multiple_attempts' => ['required', 'boolean'],
            'proctored' => ['required', 'boolean'],
            'is_active' => ['nullable', 'boolean'],
        ];
    }
}
