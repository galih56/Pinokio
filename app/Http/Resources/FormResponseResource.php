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
            
            // Form entries with field information
            'entries' => $this->whenLoaded('entries', function () {
                return $this->entries->map(function ($entry) {
                    $formField = $entry->formField;
                    $decoded_value = $entry->decoded_value;

                    // Map options outside of form_field
                    $optionsArray = isset($formField->options)
                        ? $formField->options->pluck('label')->toArray()
                        : [];

                    $resolvedValue = $decoded_value;
                        
                    if(isset($formField->fieldType)){
                        $selectableTypes = ['select', 'radio', 'checkbox'];
                        if (in_array($formField->fieldType->name, $selectableTypes)) {
                            if( is_array($decoded_value)){
                                $resolvedValue = implode(', ', $optionsArray);
                            }else if(is_scalar($decoded_value)){

                                $option = $formField->options->firstWhere('id', $decoded_value);
                                $resolvedValue = $option ? $option->label : $decoded_value;
                            }
                        }
                    }    
                    
                    return [
                        'id' => $entry->id,
                        'value' => $resolvedValue,

                        // Still include form_field info, but without options
                        'form_field' => isset($formField) ? [
                            'id' => $formField->id,
                            'label' => $formField->label,
                            'field_type_id' => $formField->field_type_id,
                            'field_type' => isset($formField->fieldType) ? [
                                'id' => $formField->fieldType->id,
                                'name' => $formField->fieldType->name,
                            ] : null,
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