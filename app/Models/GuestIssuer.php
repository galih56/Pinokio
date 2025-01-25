<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class GuestIssuer extends Model
{
    protected $table = 'guest_issuers';

    public $timestamps = true;
    protected $fillable = [
         'name', 'email'
    ];

    public function issues()
    {
        return $this->hasMany(Issue::class, 'guest_issuer_id');
    }

    public function files()
    {
        return $this->morphMany(File::class, 'uploader');
    }
}
