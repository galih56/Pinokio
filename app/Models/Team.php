<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Team extends Model
{
    protected $fillable = ['name'];
    
    public function assignments()
    {
        return $this->morphMany(Assignment::class, 'assignee');
    }
}
