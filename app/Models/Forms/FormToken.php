<?php
namespace App\Models\Forms;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class FormToken extends Model
{
    use HasFactory;

    protected $fillable = [
        'form_id',
        'token',
        'identifier',
        'open_time',
        'submitted_time',
        'is_used',
        'expires_at',
    ];

    protected $casts = [
        'open_time' => 'datetime',
        'submitted_time' => 'datetime',
        'expires_at' => 'datetime',
        'is_used' => 'boolean',
    ];

    public function form()
    {
        return $this->belongsTo(Form::class);
    }
}
