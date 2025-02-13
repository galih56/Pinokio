<?php

namespace App\Http\Requests\Issue;

use App\Http\Requests\BaseRequest;

class UpdateIssueStatusRequest extends BaseRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return auth()->check();
    }


    /**
     * Get the validation rules that apply to the request.
     *
     * @return array
     */
    public function rules(): array
    {
        return [
            'status' => 'required',
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
        ];
    }
}
