<?php

namespace App\Http\Resources;

use App\Services\HashIdService;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class UserRoleResource extends JsonResource
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
            'code' => $this->code,
            'name' => $this->name,
        ];

        if($this->updated_at) $data['updated_at'] = $this->updated_at;
        if($this->created_at) $data['created_at'] = $this->created_at;
        return $data;
    }
}
