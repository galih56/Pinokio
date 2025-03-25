<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class Team extends Model
{
    protected $fillable = ['name', 'description', 'code', 'color','created_by'];

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
        return $this->belongsToMany(User::class, 'team_members','team_id','user_id');
    }

    public function creator(){
        return $this->belongsTo(User::class, 'user_id');
    }
    
    public function team_members()
    {
        return $this->hasMany(TeamMember::class, 'team_id');
    }
}
