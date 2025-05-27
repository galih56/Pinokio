<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class FormResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @param  \Illuminate\Http\Request  $request
     */
    public function toArray($request)
    {
        return [
            'id' => $this->id,
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

            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),
        ];
    }
}
