<?php

namespace App\Models\Forms;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use App\Models\User;


class FormSubmission extends Model
{
    protected $fillable = [
        'form_id',
        'submitted_by',
        'submitted_at',
    ];

    public $timestamps = false; 

    protected $casts = [
        'submitted_at' => 'datetime'
    ];

    public function form(): BelongsTo
    {
        return $this->belongsTo(Form::class);
    }

    public function submittedByUser(): BelongsTo
    {
        return $this->belongsTo(User::class, 'submitted_by');
    }

    public function entries(): HasMany
    {
        return $this->hasMany(FormEntry::class);
    }

    public function attempts()
    {
        return $this->hasMany(FormAttempt::class, 'form_id', 'form_id');
    }
}