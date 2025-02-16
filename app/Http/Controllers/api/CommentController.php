<?php

namespace App\Http\Controllers\api;

use App\Models\Comment;
use App\Helpers\ApiResponse;
use App\Models\User;
use App\Services\CommentService;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use App\Http\Requests\Comment\StoreCommentRequest;
use App\Http\Requests\Comment\UpdateCommentRequest;
use App\Http\Requests\Comment\GetCommentRequest;
use App\Http\Resources\CommentResource;
use Illuminate\Database\Eloquent\Relations\Relation;

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

    protected $commenterTypes = [
        'user' => \App\Models\User::class,
        'guest_issuer' => \App\Models\GuestIssuer::class,
    ];

    public function index(GetCommentRequest $request)
    {
        $query = Comment::query();
    
        // Use Laravel's built-in method to resolve polymorphic types
        if ($request->has('commentable_id') && $request->has('commentable_type')) {
            $commentableType = Relation::getMorphedModel($request->commentable_type);
    
            if ($commentableType) {
                $query->where('commentable_id', $request->commentable_id)
                      ->where('commentable_type', $commentableType);
            }
        }
    
        // Paginate and return the results
        $comments = $query->with(['commentable', 'commenter'])->paginate($request->per_page ?? 15);
        
        return response()->json([
            'data' => CommentResource::collection($comments),
            'meta' => [
                'total' => $comments->total(),
                'per_page' => $comments->perPage(),
                'current_page' => $comments->currentPage(),
                'total_pages' => $comments->lastPage(),
            ],
        ]);
    }
    
    
    /**
     * Store a new comment.
     *
     * @param StoreCommentRequest $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function store(StoreCommentRequest $request)
    {

        try {
            $data = $request->validated();
            $commentableType = $this->commentableTypes[$request->commentable_type] ?? null;

            if(isset($data['commentable_id']) && $commentableType){
                $data['commentable_type'] = $commentableType;
            }

            $comment = $this->commentService->createComment($data);

            return ApiResponse::sendResponse($comment, 'Comment Create Successful', 'success', 201);
        } catch (\Exception $ex) {
            return ApiResponse::rollback($ex);
        }
    }
    
    /**
     * Update the specified resource in storage.
     */
    public function update($id, UpdateCommentRequest $request)
    {
        try {
            $comment = $this->commentService->updateComment($id, $request->validated());

            return ApiResponse::sendResponse($comment, 'Comment Update Successful', 'success', 201);
        } catch (\Exception $ex) {
            return ApiResponse::rollback($ex);
        }
    }

    /**
     * Mark a comment as read by the authenticated user.
     *
     * @param Request $request
     * @param Comment $comment
     * @return \Illuminate\Http\JsonResponse
     */
    public function markAsRead(Request $request, Comment $comment)
    {
        $user = $request->user();
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
        $user = $request->user();
        $unreadComments = $this->commentService->getUnreadComments($user);

        return response()->json($unreadComments);
    }

    /**
     * Check if a comment has been read by the authenticated user.
     *
     * @param Request $request
     * @param Comment $comment
     * @return \Illuminate\Http\JsonResponse
     */
    public function isRead(Request $request, Comment $comment)
    {
        $user = $request->user();
        $isRead = $this->commentService->isRead($comment, $user);

        return response()->json(['is_read' => $isRead]);
    }
}