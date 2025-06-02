<?php
namespace App\Models\Forms;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Form extends Model
{
    use HasFactory;

    protected $fillable = [
        'title',
        'type',
        'form_code',
        'form_url',
        'access_type',
        'identifier_label',
        'identifier_description',
        'identifier_type',
        'proctored',
        'expires_at',
        'time_limit',
        'allow_multiple_attempts',
        'is_active',
    ];

    public function tokens()
    {
        return $this->hasMany(FormToken::class);
    }

    public function attempts()
    {
        return $this->hasMany(FormAttempt::class);
    }

    public function template()
    {
        return $this->hasOne(FormTemplate::class);
    }
}
