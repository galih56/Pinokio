<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CommentRead extends Model
{
    protected $table = 'comment_reads'; 

    public function comment()
    {
        return $this->belongsTo(Comment::class);
    }

    public function reader()
    {
        return $this->morphTo(); 
    }
}
