<?php

namespace App\Http\Requests\UserRole;

use App\Models\UserRole;
use App\Services\HashIdService;
use Illuminate\Foundation\Http\FormRequest;

class UpdateUserRoleRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255', 'unique:user_roles,name,' . $this->route('id')],
            // 'code' => ['required', 'string', 'max:255', 'unique:user_roles,code,' . $this->route('id')],
            'description' => ['nullable', 'string', 'max:255'],
        ];
    }

    public function messages(): array
    {
        return [
            'name.required' => 'The role name is required.',
            'name.unique' => 'This role name is already taken.',
            // 'code.required' => 'The role code is required.',
            // 'code.unique' => 'This role code is already taken.',
            'description.max' => 'The description must not exceed 255 characters.',
        ];
    }
}
