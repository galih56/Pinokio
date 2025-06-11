<?php

namespace App\Models\Forms;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class FormField extends Model
{
    protected $fillable = [
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
        return $this->belongsTo(FieldType::class);
    }
    
    public function toArray()
    {
        $array = parent::toArray();
        
        if ($this->fieldHasOptions()) {
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
}
