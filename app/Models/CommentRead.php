<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CommentRead extends Model
{
    protected $table = 'comment_reads';

    protected $fillable = ['comment_id', 'user_id', 'read_at'];
    public $timestamps = false;

    public function comment()
    {
        return $this->belongsTo(Comment::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
