<?php

namespace App\Http\Requests\Team;

use App\Models\TeamRole;
use App\Services\HashIdService;
use Illuminate\Foundation\Http\FormRequest;

class UpdateTeamRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true; // Change this if you have authorization logic
    }

    public function rules(): array
    {
        return [
            'name' => 'sometimes|required|string|max:255|unique:teams,name,' . $this->route('team'),
            'description' => 'nullable|string|max:500',
            'members' => 'nullable|array',
            'members.*' => 'exists:users,id' // Validate user IDs
        ];
    }

    public function messages(): array
    {
        return [
            'name.required' => 'The team name is required.',
            'name.string' => 'The team name must be a valid string.',
            'name.max' => 'The team name cannot exceed 255 characters.',
            'name.unique' => 'This team name is already taken.',
            'description.string' => 'The description must be a valid string.',
            'description.max' => 'The description cannot exceed 500 characters.',
            'members.array' => 'The members must be an array of user IDs.',
            'members.*.exists' => 'One or more selected members do not exist.',
        ];
    }
}
