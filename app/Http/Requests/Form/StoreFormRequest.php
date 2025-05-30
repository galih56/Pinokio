<?php

namespace App\Http\Requests\Form;

use App\Services\HashidService;
use App\Http\Requests\BaseRequest;
use Illuminate\Validation\Rule;

class StoreFormRequest extends BaseRequest
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

            'form_url' => [
                Rule::requiredIf(fn () => $this->input('provider') === 'Google Form'),
                'nullable',
                'url',
            ],

            'access_type' => ['required', Rule::in(['public', 'token', 'identifier'])],

            'identifier_label' => [
                Rule::requiredIf(fn () => $this->input('access_type') === 'identifier'),
                'nullable',
                'string',
            ],
            'identifier_description' => ['nullable', 'string'],
            'identifier_type' => [
                Rule::requiredIf(fn () => $this->input('access_type') === 'identifier'),
                Rule::in(['Free Text', 'Email', 'Number']),
            ],

            'time_limit' => ['nullable', 'integer'],
            'allow_multiple_attempts' => ['required', 'boolean'],
            'proctored' => ['required', 'boolean'],
            'is_active' => ['nullable', 'boolean'],
        ];
    }

    public function withValidator($validator): void
    {
        $validator->after(function ($validator) {
            if ($this->input('provider') === 'Google Form') {
                $url = $this->input('form_url');

                if ($url && !str_contains($url, 'docs.google.com/forms')) {
                    $validator->errors()->add('form_url', 'The form_url must be a valid Google Form link.');
                }
            }
        });
    }

}
