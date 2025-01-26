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
            'title' => $this->title,
            'status' => $this->status,
            'issuer' => $this->whenLoaded('issuer', fn() => ([
                'id' => $hashid->encode($this->issuer->id), 
                'email' => $this->issuer->email,
                'name' => $this->issuer->name,
            ])),    
            'description' => $this->description,
            'due_date' => $this->due_date,
            'updated_at' => $this->updated_at,
            'created_at' => $this->created_at,
        ];
        
        return $data;
    }
}
