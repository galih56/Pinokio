<?php

namespace App\Http\Requests\Comment;

use App\Services\HashidService;
use App\Http\Requests\BaseRequest;

class StoreCommentRequest extends BaseRequest
{
    /**
     * Determine if the user is authorized to make this request.
     *
     * @return bool
     */
    public function authorize()
    {
        // If the commenter is a "User", ensure they are authenticated
        if ($this->input('commenter_type') === 'User') {
            return auth()->check();
        }
    
        return true;
    }

    /**
     * Prepare the data for validation.
     */
    protected function prepareForValidation(): void
    {
        $hashidService = new HashidService();

        if ($this->has('commentable_id')) {
            $this->merge([
                'commentable_id' => $hashidService->decode($this->input('commentable_id')),
            ]);
        }
    
        $this->merge([
            'ip_address' => $this->ip(),
        ]);
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, mixed>
     */
    public function rules()
    {
        return [
            'ip_address' => 'nullable|ip',
            'comment' => 'required|string|max:1000', 
            'commentable_id' => 'required|integer', 
            'commentable_type' => 'required|string|in:issue,project,task', 
            'commenter_type' => 'required|string|in:user,guest_issuer',
            'name' => 'required_if:commenter_type,guest_issuer|nullable|string|max:255',
            'email' => 'required_if:commenter_type,guest_issuer|nullable|email|max:255',
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
            'comment.required' => 'The comment field is required.',
            'comment.string' => 'The comment must be a string.',
            'comment.max' => 'The comment may not be greater than 1000 characters.',
            'commentable_id.required' => 'The commentable ID is required.',
            'commentable_id.integer' => 'The commentable ID must be an integer.',
            'commentable_type.required' => 'The commentable type is required.',
            'commentable_type.string' => 'The commentable type must be a string.',
            'commentable_type.in' => 'The commentable type must be one of: issue, project, task.',
            'name.required_if' => 'Name is required',
            'email.required_if' => 'Email is required',
        ];
    }
}