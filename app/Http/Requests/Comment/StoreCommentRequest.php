<?php

namespace App\Http\Requests\Comment;

use Illuminate\Foundation\Http\FormRequest;
use App\Services\HashidService;

class StoreCommentRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     *
     * @return bool
     */
    public function authorize()
    {
        // Only allow authenticated users to create comments
        return  true;
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
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, mixed>
     */
    public function rules()
    {
        return [
            'comment' => 'required|string|max:1000', 
            'commentable_id' => 'required|integer', 
            'commentable_type' => 'required|string|in:issue,project,task', 
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
        ];
    }
}