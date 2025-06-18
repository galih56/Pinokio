<?php

namespace App\Http\Requests\Issue;

use App\Services\HashidService;
use App\Http\Requests\BaseRequest;

class GetPublicIssuesRequest extends BaseRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
         return  [
            'ip_address' => 'nullable|ip',
            'name' => 'required|string|min:1|max:255', 
            'email' => 'required|string|email|min:1|max:255', 
        ];
    }

    /**
     * Prepare the data for validation.
     */
    protected function prepareForValidation(): void
    {
        $this->merge([
            'ip_address' => $this->ip(),
            'issuer_type' => 'guest_issuer'
        ]);
    }

    /**
     * Get the custom error messages for validation.
     *
     * @return array
     */
    public function messages(): array
    {
        return [
            'name.required' => 'Please tell us your name.',
            'email.required' => 'Please tell us your email.',
            'email.email' => 'Please provide a valid email address.',
        ];
    }
}
