<?php

namespace App\Models\Logs;

use Illuminate\Database\Eloquent\Model;

class IssueLog extends Model
{
    protected $table = 'issue_logs';

    public $timestamps = true;
    protected $fillable = [
        'id', 'issue_id', 'action', 'action_details', 'user_id', 'user_type'
    ];

    public function issuer()
    {
        return $this->morphTo();
    }
}
