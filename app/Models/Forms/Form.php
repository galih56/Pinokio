<?php
namespace App\Models\Forms;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Form extends Model
{
    use HasFactory;

    protected $fillable = [
        'title',
        'type',
        'form_code',
        'form_url',
        'identifier_label',
        'identifier_description',
        'identifier_type',
        'proctored',
        'expires_at',
        'time_limit',
        'allow_multiple_attempts',
        'is_active',
    ];

    protected $casts = [
        'proctored' => 'boolean',
        'requires_token' => 'boolean',
        'requires_identifier' => 'boolean',
        'allow_multiple_attempts' => 'boolean',
        'is_active' => 'boolean',
        'expires_at' => 'datetime',
    ];

    public function tokens()
    {
        return $this->hasMany(FormToken::class);
    }

    public function attempts()
    {
        return $this->hasMany(FormAttempt::class);
    }

    public function sections(): HasMany
    {
        return $this->hasMany(FormSection::class);
    }

    public function submissions(): HasMany
    {
        return $this->hasMany(FormSubmission::class);
    }

    public function entries(): HasMany
    {
        return $this->hasMany(FormEntry::class);
    }

}
