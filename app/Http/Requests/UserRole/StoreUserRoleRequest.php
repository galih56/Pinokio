<?php

namespace App\Http\Requests\UserRole;

use App\Services\HashIdService;
use App\Http\Requests\BaseRequest;

class StoreUserRoleRequest extends BaseRequest
{
    public function authorize(): bool
    {
        return true; 
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255', 'unique:user_roles,name'],
            'code' => ['required', 'string', 'max:255', 'unique:user_roles,code'],
            'description' => ['nullable', 'string', 'max:255'],
        ];
    }

    public function messages(): array
    {
        return [
            'name.required' => 'The role name is required.',
            'name.unique' => 'This role name is already taken.',
            'code.required' => 'The role code is required.',
            'code.unique' => 'This role code is already taken.',
            'description.max' => 'The description must not exceed 255 characters.',
        ];
    }
}
