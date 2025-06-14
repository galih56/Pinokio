<?php

namespace App\Models\Forms;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class FormField extends Model
{
    protected $fillable = [
        'id',
        'form_section_id',
        'label',
        'name',
        'placeholder',
        'is_required',
        'image_path',
        'order',
        'field_type_id',
    ];

    protected $keyType = 'string';
    public $incrementing = false;

    protected $casts = [
        'is_required' => 'boolean',
    ];

    public function section(): BelongsTo
    {
        return $this->belongsTo(FormSection::class, 'form_section_id');
    }

    public function options(): HasMany
    {
        return $this->hasMany(FormFieldOption::class, 'form_field_id');
    }

    public function fieldType(): BelongsTo
    {
        return $this->belongsTo(FieldType::class, 'field_type_id');
    }
        
    public function entries(): HasMany
    {
        return $this->hasMany(FormEntry::class);
    }
    
    public function toArray()
    {
        $array = parent::toArray();
        
        // Check if fieldType relationship is loaded before calling fieldHasOptions
        if ($this->relationLoaded('fieldType') && $this->fieldHasOptions()) {
            $array['options'] = $this->options->map(function ($option) {
                return [
                    'id' => $option->id,
                    'label' => $option->label,
                    'value' => $option->value,
                ];
            });
        }
        
        return $array;
    }

    public function fieldHasOptions()
    {
        // Add a safety check
        if (!$this->relationLoaded('fieldType') || !$this->fieldType) {
            return false;
        }
        
        $fieldTypesWithOptions = ['select', 'radio', 'checkbox', 'dropdown'];
        return in_array($this->fieldType->name, $fieldTypesWithOptions);
    }
}
