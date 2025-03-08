<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Team extends Model
{
    protected $fillable = ['name'];
    
    protected $fillable = ['name', 'description', 'code'];

    public static function boot()
    {
        parent::boot();

        static::creating(function ($team) {
            $team->code = self::generateUniqueCode($team->name);
        });
    }

    public static function generateUniqueCode($name)
    {
        $slug = Str::slug($name, '-'); // Convert name to URL-friendly slug
        $count = self::where('code', 'LIKE', "{$slug}%")->count();

        return $count ? "{$slug}-" . ($count + 1) : $slug;
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
}
