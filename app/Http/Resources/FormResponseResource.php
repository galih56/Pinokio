<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use App\Services\HashIdService;

class FormResponseResource extends JsonResource
{
    protected HashIdService $hashid;

    public function __construct($resource)
    {
        parent::__construct($resource);
        $this->hashid = new HashIdService(); 
    }

    public function toArray(Request $request): array
    {
        $form_id = $this->hashid->encode($this->form_id);
        return [
            'id' => $this->hashid->encode($this->id),
            'form_id' => $form_id,
            'submitted_at' => $this->submitted_at,
            
            // Form information (loaded via 'form:id,title,description')
            'form' => $this->whenLoaded('form', function () use ($form_id) {
                return [
                    'id' => $form_id,
                    'title' => $this->form->title,
                    'description' => $this->form->description,
                ];
            }),
            
            // User who submitted the form (loaded via 'submittedByUser:id,name,email')
            'submitted_by_user' => $this->whenLoaded('submittedByUser', function () {
                return [
                    'id' => $this->submittedByUser->id,
                    'name' => $this->submittedByUser->name,
                    'email' => $this->submittedByUser->email,
                ];
            }),
            
            // Form entries with field information
            'entries' => $this->whenLoaded('entries', function () {
                return $this->entries->map(function ($entry) {
                    return [
                        'id' => $entry->id,
                        'value' => $entry->decoded_value, // Using the helper method
                        'raw_value' => $entry->value,
                        
                        // Form field information
                        'form_field' => isset($entry->formField) ? [
                            'id' => $entry->formField->id,
                            'name' => $entry->formField->name,
                            'label' => $entry->formField->label,
                            'field_type_id' => $entry->formField->field_type_id,
                            
                            // Field type information
                            'field_type' => isset($entry->formField->fieldType) ? [
                                'id' => $entry->formField->fieldType->id,
                                'name' => $entry->formField->fieldType->name,
                            ] : null,
                            
                            // Field options (if applicable)
                            'options' => isset($entry->formField->options) 
                                ? $entry->formField->options->map(function ($option) {
                                    return [
                                        'id' => $option->id,
                                        'form_field_id' => $option->form_field_id,
                                        'label' => $option->label,
                                        'value' => $option->value,
                                    ];
                                })
                                : [],
                        ] : null,
                    ];
                });
            }),
            
            // Additional metadata
            'total_entries' => $this->whenLoaded('entries', fn() => $this->entries->count(), 0),
            'has_attempts' => $this->whenLoaded('attempts', fn() => $this->attempts->isNotEmpty(), false),
        ];
    }
}