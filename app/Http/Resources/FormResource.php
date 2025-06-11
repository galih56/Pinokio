<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;
use App\Services\HashIdService;
use App\Services\FileService;

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
            'id' => app(HashIdService::class)->encode($this->id), 
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
            
            'sections' => $this->whenLoaded('sections', fn() =>  
                $this->sections->map(fn ($section) => [
                    'id' => app(HashIdService::class)->encode($section->id),
                    'name' => $section->name,
                    'description' => $section->description,
                    'order' => $section->order,
                    'image' => ($section->image_path ? app(FileService::class)->getUrl($section->image_path) : null),
                    'fields' => $section->fields->map(fn ($field) => [
                        'id' => app(HashIdService::class)->encode($field->id),
                        'label' => $field->label,
                        'name' => $field->name,
                        'placeholder' => $field->placeholder,
                        'isRequired' => $field->is_required,
                        'order' => $field->order,
                        'image' => ($field->image_path ? app(FileService::class)->getUrl($field->image_path) : null),
                        'type' => $field->fieldType->name,
                        'options' => $field->options->map(fn ($opt) => [
                            'id' => $opt->id,
                            'label' => $opt->label,
                            'value' => $opt->value,
                        ]),
                    ])
                ])
            )
        ];
    }
}
