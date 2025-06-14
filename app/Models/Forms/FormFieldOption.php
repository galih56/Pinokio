<?php

namespace App\Models\Forms;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class FormFieldOption extends Model
{
    protected $fillable = [
        'id',
        'form_field_id',
        'label',
        'value',
    ];

    protected $keyType = 'string';
    public $incrementing = false;

    public function field(): BelongsTo
    {
        return $this->belongsTo(FormField::class, 'form_field_id');
    }
}
