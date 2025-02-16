<?php 
namespace App\Services;

use App\Models\Comment;
use App\Models\User;
use App\Models\GuestIssuer;
use Illuminate\Support\Facades\Log;

class CommentService
{  
    protected $guestIssuerService;
    protected $fileService;

    public function __construct(GuestIssuerService $guestIssuerService)
    {
        $this->guestIssuerService = $guestIssuerService;
    }
  

    public function createComment(array $data): Comment
    {
        try {
            $user = null;
            if ($data['commenter_type'] == 'guest_issuer') {
                $user = $this->guestIssuerService->getOrCreateGuestIssuer($data['email'], $data['name'], $data['ip_address']);
                $userType = 'guest_issuer';
            } else {
                $user = auth()->user();
                $userType = 'user';
            }
    
            $comment = [
                'comment' => $data['comment'],
                'commentable_id' => $data['commentable_id'],
                'commentable_type' => $data['commentable_type'],
            ];

            if($user){
                $comment['commenter_id'] = $user->id;
                $comment['commenter_type'] = $userType;
            }

            $comment = Comment::create($comment);

            return $comment;
        } catch (\Exception $e) {
            Log::error('Error creating comment: ' . $e->getMessage());
            throw $e;
        }
    }

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