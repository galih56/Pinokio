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

    public function comments()
    {
        return $this->morphMany(Comment::class, 'commentable');
    }

    public function files()
    {
        return $this->morphMany(File::class, 'related', 'related_type', 'related_id');
    }

    public function issue()
    {
        return $this->belongsTo(Issue::class, 'issue_id');
    }

    public function project()
    {
        return $this->belongsTo(Project::class, 'project_id');
    }

    public function parent()
    {
        return $this->belongsTo(Task::class, 'task_id');
    }

    public function children()
    {
        return $this->hasMany(Task::class, 'task_id');
    }

    public function childrenWithDepth($depth = 1)
    {
        return $this->hasMany(Task::class, 'task_id')
                    ->when($depth > 1, fn($query) => $query->with(['children' => fn($q) => $q->childrenWithDepth($depth - 1)]));
    }

    /**
     * Load child tasks recursively with depth control.
     *
     * @param int $currentDepth
     * @param int $maxDepth
     */
    public function loadChildrenRecursively($currentDepth = 0, $maxDepth = 2)
    {
        if ($currentDepth < $maxDepth) {
            $this->load(['children' => function ($query) use ($currentDepth, $maxDepth) {
                $query->with(['children' => function ($q) use ($currentDepth, $maxDepth) {
                    $q->loadChildrenRecursively($currentDepth + 1, $maxDepth);
                }]);
            }]);
        }
    }

    
}
