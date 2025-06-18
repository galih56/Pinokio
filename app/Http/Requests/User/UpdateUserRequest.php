<?php

namespace App\Http\Requests\User;

use App\Models\UserRole;
use App\Services\HashIdService;
use App\Http\Requests\BaseRequest;

class UpdateUserRequest extends BaseRequest
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
        if ($this->has('role_code')) {
            // Find the role ID based on the role code
            $role = UserRole::where('code', $this->input('role_code'))->first();

            if ($role) {
                $this->merge([
                    'role_id' => $role->id, // Add role_id to the request data
                ]);
            }
        }

    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'username' => ['required', 'string', 'max:255'],
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255'],
            'password' => ['nullable', 'string', 'min:6', 'confirmed'],
            'role_code' => ['required', 'string', 'exists:user_roles,code'], // Validate the role code exists
            'role_id' => ['required', 'exists:user_roles,id'], // Ensure role_id is valid (added via prepareForValidation)
        ];
    }

    /**
     * Get custom messages for validator errors.
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'role_code.exists' => 'The provided role code is invalid.',
            'role_id.exists' => 'The role ID is invalid.',
        ];
    }
}
