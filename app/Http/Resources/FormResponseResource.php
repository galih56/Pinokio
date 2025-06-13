<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class FormResponseResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'form_id' => $this->form_id,
            'submitted_at' => $this->submitted_at,
            
            // Form information (loaded via 'form:id,title,description')
            'form' => [
                'id' => $this->form->id,
                'title' => $this->form->title,
                'description' => $this->form->description,
            ],
            
            // User who submitted the form (loaded via 'submittedByUser:id,name,email')
            'submitted_by_user' => [
                'id' => $this->submittedByUser->id,
                'name' => $this->submittedByUser->name,
                'email' => $this->submittedByUser->email,
            ],
            
            // Form entries with field information
            'entries' => $this->entries->map(function ($entry) {
                return [
                    'id' => $entry->id,
                    'value' => $entry->decoded_value, // Using the helper method
                    'raw_value' => $entry->value,
                    
                    // Form field information
                    'form_field' => [
                        'id' => $entry->formField->id,
                        'name' => $entry->formField->name,
                        'label' => $entry->formField->label,
                        'field_type_id' => $entry->formField->field_type_id,
                        
                        // Field type information
                        'field_type' => [
                            'id' => $entry->formField->fieldType->id,
                            'name' => $entry->formField->fieldType->name,
                        ],
                        
                        // Field options (if applicable)
                        'options' => $entry->formField->options->map(function ($option) {
                            return [
                                'id' => $option->id,
                                'form_field_id' => $option->form_field_id,
                                'label' => $option->label,
                                'value' => $option->value,
                            ];
                        }),
                    ],
                ];
            }),
            
            // Additional metadata
            'total_entries' => $this->entries->count(),
            'has_attempts' => $this->attempts->isNotEmpty(),
        ];
    }
}
