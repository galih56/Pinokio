<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Project extends Model
{
    protected $table = 'projects';

    public $timestamps = true;
    protected $fillable = [
        'title',
        'description',
        'status',
        'start',
        'end'
    ];    
    
    public function comments()
    {
        return $this->morphMany(Comment::class, 'commentable');
    }
    
    public function assignees()
    {
        return $this->morphToMany(User::class, 'assignee', 'assignments', 'issue_id', 'assignee_id')
                    ->using(Assignment::class)
                    ->withTimestamps();
    }
    
    public function files()
    {
        return $this->morphMany(File::class, 'related', 'related_type', 'related_id');
    }

    public function issue(){
        return $this->belongsTo(Issue::class, 'issue_id');
    }

    public function tasks(){
        return $this->hasMany(Task::class, 'task_id');
    }
}
