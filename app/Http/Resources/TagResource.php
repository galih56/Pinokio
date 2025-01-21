<?php

namespace App\Http\Resources;

use App\Services\HashIdService;
use Hashids\Hashids;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class TagResource extends JsonResource
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
            'color' => $this->color,
            'updated_at' => $this->updated_at,
            'created_at' => $this->created_at,
        ];
        
        return $data;
    }
}

