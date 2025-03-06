<?php 
namespace App\Services;

use App\Models\Comment;
use App\Models\User;
use App\Models\GuestIssuer;
use Illuminate\Support\Facades\Log;
use Auth;

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

    public function getComments($data)
    {
        $query = Comment::query();
    
        // Filter by commentable entity (Issue, Project, Task)
        if (isset($data['commentable_id']) && isset($data['commentable_type'])) {
            $query->where('commentable_id', $data['commentable_id'])
                  ->where('commentable_type', $data['commentable_type']);
        }
    
        $userId = null;
    
    
        // If authenticated, use user ID (only admins track read state)
        if (\Auth::check()) {
            $userId = \Auth::id();
        }
    
        // If the requester is an authenticated user, check their read state
        if ($userId) {
            $query = $query->withExists([
                'reads as is_read' => function ($query) use ($userId) {
                    $query->where('user_id', $userId);
                }
            ]);
        }
    
        $query = $query->withExists([
            'reads as is_read_by_others' => function ($q) {
                $q->whereColumn('user_id', '!=', 'comments.commenter_id');
            }
        ]);
        
        // Eager load relationships
        $query->with(['commentable', 'commenter']);
    
        // Paginate results
        return $query->paginate($data['per_page'] ?? 15);
    }
    

    public function getUnreadComments(User $user)
    {
        return Comment::whereDoesntHave('readers', function ($query) use ($user) {
            $query->where('user_id', $user->id);
        })->get();
    }

    public function markAsRead($commentId)
    {
        $user = Auth::user();
        
        $comment = Comment::findOrFail($commentId);
        
        $comment->reads()->updateOrCreate(
            ['user_id' => $user->id, 'comment_id' => $commentId],
            ['read_at' => now()]
        );
        return $comment;
    }

    public function isRead(Comment $comment, User $user): bool
    {
        return $comment->readers()
                       ->where('user_id', $user->id)
                       ->whereNotNull('read_at')
                       ->exists();
    }
}