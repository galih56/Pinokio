<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Issue extends Model
{
    public $timestamps = true;
    protected $fillable = [
        'title', 'description', 'due_date', 'project_id', 'issuer_id', 'issuer_type' 
    ];

    public static function boot()
    {
        parent::boot();

    }
    
    public function issuer()
    {
        return $this->morphTo();
    }

    public function tags()
    {
        return $this->belongsToMany(Tag::class, 'issue_tag', 'issue_id', 'tag_id');
    }

    public function comments()
    {
        return $this->morphMany(Comment::class, 'commentable');
    }
    
    public function files()
    {
        return $this->morphToMany(
            File::class,
            'related',
            'file_associations',
            'related_id',
            'file_id'
        );
    }
    
    public function tasks()
    {
        return $this->hasMany(Task::class, 'task_id');
    }
    
    public function logs()
    {
        return $this->hasMany(\App\Models\Logs\IssueLog::class, 'issue_id');
    }
    
    public function projects()
    {
        return $this->hasMany(Project::class, 'project_id');
    }
    
    public function assignees()
    {
        return $this->morphToMany(User::class, 'assignee', 'assignments', 'issue_id', 'assignee_id')
                    ->using(Assignment::class)
                    ->withTimestamps();
    }
}
