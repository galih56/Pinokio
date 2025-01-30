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

        static::saving(function ($model) {
            $allowedClasses = [User::class, GuestIssuer::class];
            if (!in_array($model->issuer_type, $allowedClasses)) {
                throw new \Exception("Invalid issuer_type: {$model->issuer_type}");
            }
        });
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
    
    public function issues()
    {
        return $this->morphedByMany(
            Issue::class,
            'related',
            'file_associations',
            'file_id',
            'related_id'
        );
    }
    
    public function tasks()
    {
        return $this->morphedByMany(
            Task::class,
            'related',
            'file_associations',
            'file_id',
            'related_id'
        );
    }
    public function assignees()
    {
        return $this->morphToMany(User::class, 'assignee', 'assignments', 'issue_id', 'assignee_id')
                    ->using(Assignment::class)
                    ->withTimestamps();
    }
}
