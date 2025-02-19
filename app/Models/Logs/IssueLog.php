<?php

namespace App\Models\Logs;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class IssueLog extends Model
{
    protected $table = 'issue_logs';

    public $timestamps = true;
    protected $fillable = [
        'id', 'issue_id', 'action', 'action_details', 'user_id', 'user_type'
    ];
    
    public function issue() : BelongsTo{
        return $this->belongsTo(\App\Models\Issue::class, 'issue_id');
    }

    public function user()
    {
        return $this->morphTo();
    }
}
