<?php

namespace App\Http\Requests\Comment;

use App\Services\HashidService;
use App\Http\Requests\BaseRequest;

class GetCommentRequest extends BaseRequest
{
    /**
     * Determine if the user is authorized to make this request.
     *
     * @return bool
     */
    public function authorize()
    {
        // Allow all users to access this endpoint
        return true;
    }

    /**
     * Prepare the data for validation.
     */
    protected function prepareForValidation(): void
    {
        $hashidService = new HashidService();

        // Decode commentable_id if it is provided
        if ($this->has('commentable_id')) {
            $this->merge([
                'commentable_id' => $hashidService->decode($this->input('commentable_id')),
            ]);
        }
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, mixed>
     */
    public function rules()
    {
        return [
            'commentable_id' => 'nullable|integer', 
            'commentable_type' => 'nullable|string|in:issue,project,task', 
            'email' => 'nullable|email', 
        ];
    }

    /**
     * Get custom messages for validation errors.
     *
     * @return array<string, string>
     */
    public function messages()
    {
        return [
            'commentable_id.integer' => 'The commentable ID must be an integer.',
            'commentable_type.string' => 'The commentable type must be a string.',
            'commentable_type.in' => 'The commentable type must be one of: issue, project, task.',
            'email.email' => 'The email must be a valid email address.',
            'email.exists' => 'The provided email does not exist in our records.',
        ];
    }
}