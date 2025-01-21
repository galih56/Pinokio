<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Issue extends Model
{
    public $timestamps = true;
    protected $fillable = [
         'title', 'description', 'due_date', 'project_id', 'reporter_id', // etc
    ];

    public function guestIssuer(){
        return $this->belongsTo(GuestIssuer::class, 'guest_issuer_id');
    }

    public function tags()
    {
        return $this->belongsToMany(Tag::class, 'issue_tag', 'issue_id', 'tag_id');
    }
}
