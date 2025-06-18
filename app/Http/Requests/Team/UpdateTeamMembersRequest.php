<?php

namespace App\Http\Requests\Team;

use App\Services\HashIdService;
use App\Http\Requests\BaseRequest;

class UpdateTeamMembersRequest extends BaseRequest
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
            'members' => 'nullable|array',
            'members.*' => 'required|string', // Only user IDs, no role
        ];
    }

    protected function prepareForValidation(): void
    {
        if ($this->has('members') && is_array($this->input('members'))) {
            try {
                $members = $this->input('members');
                $decodedMembers = array_map(function ($id) {
                    $decodedId = $this->hashidService->decode($id);
                    return $decodedId ? $decodedId[0] : null;
                }, $members);

                $this->merge(['members' => array_filter($decodedMembers)]);
            } catch (\Exception $e) {
                $this->merge(['members' => []]); // Prevent breaking validation if decryption fails
            }
        }
    }

    public function messages(): array
    {
        return [
            'members.array' => 'The members must be an array.',
            'members.*.required' => 'Each member must have a user ID.',
            'members.*.string' => 'User ID must be a string.',
        ];
    }
}
