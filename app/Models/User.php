<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Laravel\Sanctum\HasApiTokens;
use App\Models\Logs\IssueLog;
use Illuminate\Database\Eloquent\Relations\MorphMany;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasApiTokens, HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'id',
        'name',
        'email',
        'username',
        'password',
        'role_id',
        'updated_at',
        'created_at'
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var array<int, string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }
    
    public function role() : BelongsTo{
        return $this->belongsTo(UserRole::class, 'role_id');
    }
    
    public function hasRole(string | array $roles):bool
    {    
        if (is_string($roles)) {
            $roles = [$roles];
        }

        return in_array($this->role->code, $roles);
    }

    public function issues()
    {
        return $this->morphMany(Issue::class, 'issuer');
    }
    
    public function files()
    {
        return $this->morphMany(File::class, 'uploader');
    }

    public function assignments()
    {
        return $this->morphMany(Assignment::class, 'assignee');
    }

    public function comments()
    {
        return $this->morphMany(Comment::class, 'commenter');
    }
    
    public function readComments()
    {
        return $this->hasMany(CommentRead::class);
    }

    public function issueLogs() : MorphMany
    {
        return $this->morphMany(IssueLog::class, 'user');
    }

}
