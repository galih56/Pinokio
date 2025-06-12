<?php

namespace App\Models\Forms;

use Illuminate\Database\Eloquent\Model;

use Illuminate\Database\Eloquent\Relations\BelongsTo;

class FormEntry extends Model
{
    protected $fillable = [
        'form_submission_id',
        'form_field_id',
        'value',
    ];
    public $timestamps = false; 

    public function formSubmission(): BelongsTo
    {
        return $this->belongsTo(FormSubmission::class);
    }

    public function formField(): BelongsTo
    {
        return $this->belongsTo(FormField::class);
    }

    // Helper method to decode JSON values
    public function getDecodedValueAttribute()
    {
        $decoded = json_decode($this->value, true);
        return json_last_error() === JSON_ERROR_NONE ? $decoded : $this->value;
    }
}