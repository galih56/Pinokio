<?php

namespace App\Http\Requests\Issue;

use Illuminate\Foundation\Http\FormRequest;
use App\Services\HashidService;
use App\Http\Requests\BaseRequest;

class StoreIssueRequest extends BaseRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true; // Adjust authorization logic as needed
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
            'project_id' => 'nullable|string', 
            'reporter_id' => 'nullable|string', 
            'name' => 'required|string|min:1|max:255', 
            'email' => 'required|string|email|min:1|max:255', 
            'title' => 'required|string|min:1',
            'description' => 'nullable|string',
            'due_date' => 'nullable|date', 
            'files' => 'nullable|array', 
            'files.*' => 'nullable|file',
            'tag_id' => ['required', 'numeric', 'exists:tags,id'],
            'tag_ids' => ['nullable', 'array'], 
            'tag_ids.*' => ['string', 'exists:tags,id'], 
            'issuer_type' => 'required|string'
        ];
    }

    /**
     * Prepare the data for validation.
     */
    protected function prepareForValidation(): void
    {
        $hashidService = new HashidService();

        if ($this->has('tag_id')) {
            $this->merge([
                'tag_id' => $hashidService->decode($this->input('tag_id')),
            ]);
        }

        if ($this->has('tag_ids')) {
            $decryptedtag_ids = array_map(
                fn($tag_id) => $hashidService->decode($tag_id),
                $this->input('tag_ids', [])
            );
            $this->merge(['tag_ids' => $decryptedtag_ids]);
        }

        if ($this->has('project_id')) {
            $this->merge([
                'project_id' => $hashidService->decode($this->input('project_id')),
            ]);
        }

        if ($this->has('reporter_id')) {
            $this->merge([
                'reporter_id' => $hashidService->decode($this->input('reporter_id')),
            ]);
        }

        if (auth()->check()) {
            $this->merge([
                'ip_address' => $this->ip(),
                'issuer_type' => 'User'
            ]);
        }else{
            $this->merge([
                'ip_address' => $this->ip(),
                'issuer_type' => 'GuestUser'
            ]);
        }
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
            'title.required' => 'Title is required.',
            'tag_id.required' => 'Issue type is required.',
            'tag_id.exists' => 'Please select a valid issue type.',
            'tag_ids.*.exists' => 'One or more selected issue types are invalid.',
        ];
    }
}
