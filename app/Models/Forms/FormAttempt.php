<?php

namespace App\Models\FormAttempt;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class FormAttempt extends Model
{
    use HasFactory;

    protected $fillable = [
        'form_id',
        'identifier',
        'started_at',
        'submitted_at',
        'is_valid',
    ];

    protected $casts = [
        'started_at' => 'datetime',
        'submitted_at' => 'datetime',
        'is_valid' => 'boolean',
    ];

    public function form()
    {
        return $this->belongsTo(Form::class);
    }
}
