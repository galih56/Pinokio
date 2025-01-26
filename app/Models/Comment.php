<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Comment extends Model
{
    public $timestamps = true;
    protected $fillable = [
        'comment', 'commentable_type', 'commentable_id', 'commenter_type', 'commenter_id' 
    ];

    /**
     * Get the parent commentable model (Task, Project, Issue).
     */
    public function commentable()
    {
        return $this->morphTo();
    }

    /**
     * Get the commenter model (User or GuestIssuer).
     */
    public function commenter()
    {
        return $this->morphTo();
    }
    
    public function readers()
    {
        return $this->belongsToMany(User::class, 'comment_user')
                    ->withPivot('read_at')
                    ->withTimestamps();
    }
}
