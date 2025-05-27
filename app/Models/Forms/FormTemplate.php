<?php

namespace App\Models\Forms;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class FormTemplate extends Model
{
    use HasFactory;

    protected $fillable = [
        'form_id',
        'description',
    ];

    public function form()
    {
        return $this->belongsTo(Form::class);
    }
}
