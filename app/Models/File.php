<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class File extends Model
{
    use HasFactory;

    protected $table = 'files';
    public $timestamps = false;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<string>
     */
    protected $fillable = [
        'name',
        'path',
        'mime_type',
        'size',
        'uploaded_at',
        'uploader_id',
        'uploader_type',
    ];

    public function uploader()
    {
        return $this->morphTo();
    }

    public function related()
    {
        return $this->morphedByMany(
            Issue::class, 
            'related',   
            'file_associations', 
            'file_id',  
            'related_id'  
        )->withPivot('related_type');
    }
}
