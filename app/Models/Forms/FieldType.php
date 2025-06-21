<?php

namespace App\Models\Forms;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class FieldType extends Model
{
    public $timestamps = false;

    protected $fillable = ['name'];

    public function fields(): HasMany
    {
        return $this->hasMany(FormField::class);
    }
    
    static public function resolveFieldType(string $type): int
    {
        return self::where('name', $type)->value('id')
            ?? throw new \RuntimeException("Invalid field type: {$type}");
    }
}
