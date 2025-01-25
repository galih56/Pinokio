<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class FileAssociation extends Model
{
    use HasFactory;

    protected $table = 'file_associations';

    /**
     * The attributes that are mass assignable.
     *
     * @var array<string>
     */
    protected $fillable = [
        'file_id',
        'related_id',
        'related_type',
    ];

    /**
     * Get the file that owns this association.
     */
    public function file()
    {
        return $this->belongsTo(File::class, 'file_id');
    }

}
