<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class Team extends Model
{
    protected $fillable = ['name', 'description', 'code', 'color','creator_id'];

    public static function boot()
    {
        parent::boot();
    }
    
    public function assignments()
    {
        return $this->morphMany(Assignment::class, 'assignee');
    }

    public function members()
    {
        return $this->hasMany(TeamMember::class);
    }

    public function users()
    {
        return $this->belongsToMany(User::class, 'team_members');
    }
    
    public function creator(){
        return $this->belongsTo(User::class, 'user_id');
    }
}
