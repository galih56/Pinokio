<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Task extends Model
{
    protected $table = 'tasks';
    public $timestamps = true;
    protected $fillable = [
        'issue_id', 'title', 'description', 'status', 'due_date'
    ];
    
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
}
