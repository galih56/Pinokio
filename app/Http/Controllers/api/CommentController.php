<?php

namespace App\Http\Controllers\api;

use App\Models\Comment;
use App\Models\User;
use App\Services\CommentService;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;

class CommentController extends Controller
{
    protected $commentService;

    public function __construct(CommentService $commentService)
    {
        $this->commentService = $commentService;
    }
    
    /**
     * Map keywords to fully qualified class names.
     */
    protected $commentableTypes = [
        'issue' => \App\Models\Issue::class,
        'project' => \App\Models\Project::class,
        'task' => \App\Models\Task::class,
    ];

    /**
     * Fetch comments with optional filters.
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function index(Request $request)
    {
        $query = Comment::query();

        // Filter by commentable_id and commentable_type if provided
        if ($request->has('commentable_id') && $request->has('commentable_type')) {
            $commentableType = $this->commentableTypes[$request->commentable_type] ?? null;

            if ($commentableType) {
                $query->where('commentable_id', $request->commentable_id)
                      ->where('commentable_type', $commentableType);
            }
        }

        // Paginate and return the results
        $comments = $query->with(['commentable', 'commenter'])->paginate($request->per_page ?? 15);

        return response()->json([
            'data' => $comments->items(),
            'meta' => [
                'total' => $comments->total(),
                'per_page' => $comments->perPage(),
                'current_page' => $comments->currentPage(),
                'total_pages' => $comments->lastPage(),
            ],
        ]);
    }

    /**
     * Mark a comment as read.
     *
     * @param Request $request
     * @param Comment $comment
     * @return \Illuminate\Http\JsonResponse
     */
    public function markAsRead(Request $request, Comment $comment)
    {
        $user = $request->user(); // Assuming the user is authenticated
        $this->commentService->markAsRead($comment, $user);

        return response()->json(['message' => 'Comment marked as read.']);
    }
    
    /**
     * Get unread comments for the authenticated user.
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function getUnreadComments(Request $request)
    {
        $user = $request->user(); // Assuming the user is authenticated
        $unreadComments = $this->commentService->getUnreadComments($user);

        return response()->json($unreadComments);
    }
}