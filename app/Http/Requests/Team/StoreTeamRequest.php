<?php

namespace App\Http\Requests\Team;

use App\Services\HashIdService;
use App\Http\Requests\BaseRequest;

class StoreTeamRequest extends BaseRequest
{
    public function __construct(protected HashIdService $hashidService)
    {
        parent::__construct();
    }

    public function authorize(): bool
    {
        return auth()->check(); 
    }

    public function rules(): array
    {
        return [
            'name' => 'required|string|max:255|unique:teams,name',
            'description' => 'nullable|string|max:500',
            'members' => 'nullable|array',
            'members.*' => 'exists:users,id' 
        ];
    }

    protected function prepareForValidation(): void
    {
        if ($this->has('members') && is_array($this->input('members'))) {
            try {
                $members = $this->input('members');
                
                $decodedMemberIds = [];
                if($members){
                    for ($i=0; $i < count($members); $i++) { 
                        $id = $members[$i];
                        $id = $this->hashidService->decode($id);
                        if($id) $decodedMemberIds[] = $id;
                    }
                }
                $this->merge(['members' => $decodedMemberIds]);
            } catch (\Exception $e) {
                $this->merge(['members' => []]); // Prevent breaking validation if decryption fails
            }
        }
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
