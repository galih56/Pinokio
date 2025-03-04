<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Models\Logs\IssueLog;
use Illuminate\Database\Eloquent\Relations\MorphMany;

class GuestIssuer extends Model
{
    protected $table = 'guest_issuers';

    public $timestamps = true;
    protected $fillable = [
         'name', 'email'
    ];

    public function issues()
    {
        return $this->morphMany(Issue::class, 'issuer');
    }

    public function comments()
    {
        return $this->morphMany(Comment::class, 'commenter');
    }
    
    public function files()
    {
        return $this->morphMany(File::class, 'uploader');
    }
    
    public function issueLogs() : MorphMany
    {
        return $this->morphMany(IssueLog::class, 'user');
    }

    public function readComments()
    {
        return $this->morphMany(CommentRead::class, 'reader');
    }
}
