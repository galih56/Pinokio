<?php

namespace App\Http\Requests\Form;

use App\Services\HashidService;
use App\Http\Requests\BaseRequest;
use Illuminate\Validation\Rule;

class GenerateLinkRequest extends BaseRequest
{
    public function authorize(): bool
    {
        return auth()->check();
    }

    public function rules(): array
    {
        return [
            'expires_at' => [
                'required',
                'date',
                'after:now',
            ],
        ];
    }

    public function messages(): array
    {
        return [
            'expires_at.required' => 'An expiration date and time is required.',
            'expires_at.date' => 'The expiration must be a valid date.',
            'expires_at.after' => 'The expiration time must be in the future.',
        ];
    }
}
