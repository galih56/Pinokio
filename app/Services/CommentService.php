<?php 
namespace App\Services;

use App\Models\Comment;
use App\Models\User;

class CommentService
{    
    /**
    * Get unread comments for a user.
    *
    * @param User $user
    * @return \Illuminate\Database\Eloquent\Collection
    */
    public function getUnreadComments(User $user)
    {
        return Comment::whereDoesntHave('readers', function ($query) use ($user) {
            $query->where('user_id', $user->id);
        })->get();
    }
    
    /**
     * Mark a comment as read by a user.
     *
     * @param Comment $comment
     * @param User $user
     * @return void
     */
    public function markAsRead(Comment $comment, User $user)
    {
        $comment->readers()->syncWithoutDetaching([
            $user->id => ['read_at' => now()],
        ]);
    }

    /**
     * Check if a comment has been read by a user.
     *
     * @param Comment $comment
     * @param User $user
     * @return bool
     */
    public function isRead(Comment $comment, User $user): bool
    {
        return $comment->readers()
                       ->where('user_id', $user->id)
                       ->whereNotNull('read_at')
                       ->exists();
    }
}