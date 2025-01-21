<?php

namespace App\Http\Resources;

use App\Services\HashIdService;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class UserResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $hashid = new HashIdService();

        $data = [
            'id' => $hashid->encode($this->id), 
            'name' => $this->name,
            'username' => $this->username,
            'email' => $this->email,
            'role' => $this->whenLoaded('role', fn() => ([
                'id' => $hashid->encode($this->role->id), 
                'code' => $this->role->code,
                'name' => $this->role->name,
            ])),
            'updated_at' => $this->updated_at,
            'created_at' => $this->created_at
        ];

        return $data;
    }
}
