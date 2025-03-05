<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Comment extends Model
{
    protected $fillable = [
        'comment', 'commentable_type', 'commentable_id', 'commenter_type', 'commenter_id'
    ];

    public function commentable()
    {
        return $this->morphTo();
    }

    public function commenter()
    {
        return $this->morphTo();
    }

    public function reads()
    {
        return $this->hasMany(CommentRead::class);
    }

    public function unreadByUser($userId)
    {
        return $this->whereDoesntHave('reads', function ($query) use ($userId) {
            $query->where('user_id', $userId)->whereNotNull('read_at');
        });
    }
}
