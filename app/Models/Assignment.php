<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\MorphTo;

class Assignment extends Model
{
    protected $fillable = [
        'assignee_id',
        'assignee_type',
        'assignable_id',
        'assignable_type',
    ];

    /**
     * Get the entity that is assigned (User or Team).
     */
    public function assignee(): MorphTo
    {
        return $this->morphTo();
    }

    /**
     * Get the entity to which the assignee is assigned (Issue, Task, Project).
     */
    public function assignable(): MorphTo
    {
        return $this->morphTo();
    }
}
