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

    public function index(GetCommentRequest $request)
    {
        $data = $request->validated();
        $comments = $this->commentService->getComments($data);

        return response()->json([
            'data' => CommentResource::collection($comments),
            'meta' => [
                'total' => $comments->total(),
                'per_page' => $comments->perPage(),
                'current_page' => $comments->currentPage(),
                'total_pages' => $comments->lastPage(),
                'next' => $comments->lastPage(),
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
    public function markAsRead($id)
    {
        try {
            $this->commentService->markAsRead($id);
            return ApiResponse::sendResponse(null, null, 'success', 201);
        } catch (\Exception $ex) {
            return ApiResponse::rollback($ex);
        }

    }
    
}