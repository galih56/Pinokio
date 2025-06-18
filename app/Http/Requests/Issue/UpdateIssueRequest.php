<?php

namespace App\Http\Requests\Issue;

use App\Http\Requests\BaseRequest;

class UpdateIssueRequest extends BaseRequest
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
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'start' => 'nullable|date_format:Y-m-d H:i:s', 
            'end' => 'nullable|date_format:Y-m-d H:i:s|after_or_equal:start',
            'description' => ['nullable'],
        ];
    }

}
