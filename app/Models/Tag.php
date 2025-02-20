<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Tag extends Model
{
    protected $table = 'tags';
    public $timestamps = true;

    protected $fillable = ['name', 'color','is_public'];


    public function issues()
    {
        return $this->belongsToMany(Issue::class, 'issue_tag', 'tag_id', 'issue_id');
    }
}
