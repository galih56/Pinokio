<?php

namespace App\Http\Requests\Issue;

use App\Http\Requests\BaseRequest;

class ClosePublicIssueRequest extends BaseRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Prepare the data for validation.
     */
    protected function prepareForValidation(): void
    {
        $this->merge([
            'ip_address' => $this->ip(),
        ]);
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array
     */
    public function rules(): array
    {
        return [
            'ip_address' => 'nullable|ip',
            'status' => 'required|in:closed',        
            'name' => 'required|string|min:1|max:255', 
            'email' => 'required|string|email|min:1|max:255', 
        ];
    }

    /**
     * Customize the error messages for validation.
     *
     * @return array
     */
    public function messages(): array
    {
        return [
            'status.required' => 'The status is required.',
            'status.in' => 'The status must be "closed".',
            'name.required' => 'Please tell us your name.',
            'email.required' => 'Please tell us your email.',
            'email.email' => 'Please provide a valid email address.',
        ];
    }
}
