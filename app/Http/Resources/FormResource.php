<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;
use App\Services\HashIdService;

class FormResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @param  \Illuminate\Http\Request  $request
     */
    public function toArray($request)
    {
        $hashid = new HashIdService();

        return [
            'id' => $hashid->encode($this->id), 
            'title' => $this->title,
            'description' => $this->description,
            'provider' => $this->provider,
            'form_code' => $this->form_code,
            'form_url' => $this->form_url,
            
            // Access control
            'access_type' => $this->access_type,
            'identifier_label' => $this->identifier_label,
            'identifier_description' => $this->identifier_description,
            'identifier_type' => $this->identifier_type,

            'time_limit' => $this->time_limit,
            'allow_multiple_attempts' => (bool) $this->allow_multiple_attempts,
            'is_active' => (bool) $this->is_active,
            'proctored' => (bool) $this->proctored,

            'expires_at' => $this->expires_at,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
