<?php

namespace App\Http\Resources;

use App\Services\HashIdService;
use Hashids\Hashids;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class IssueResource extends JsonResource
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
            'description' => $this->description,
            'start' => $this->start,
            'end' => $this->end,
            'is_flexible' => $this->is_flexible,
            'updated_at' => $this->updated_at,
            'created_at' => $this->created_at,
        ];
        
        return $data;
    }
}
