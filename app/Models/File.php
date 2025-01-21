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
        'file_name',
        'file_path',
        'mime_type',
        'file_size',
        'uploaded_at',
        'uploader_id',
        'uploader_type',
    ];

    public function uploader()
    {
        return $this->morphTo();
    }
    
    /**
     * Get all associations for the file.
     */
    public function associations()
    {
        return $this->hasMany(FileAssociation::class);
    }
}
