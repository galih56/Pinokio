<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\api\AuthController;
use App\Http\Controllers\api\UserController;
use App\Http\Controllers\api\TeamController;
use App\Http\Controllers\api\TagController;
use App\Http\Controllers\api\IssueController;
use App\Http\Controllers\api\CommentController;

Route::group([ 
    "prefix" => "auth", 
    "as" => "authentication" 
], 
function(){
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/login', [AuthController::class, 'login']);

    Route::post('/me', [AuthController::class, 'me']);
    Route::middleware('auth:sanctum')->group(function () {
        Route::post('/logout', [AuthController::class, 'logout']);
    });
});



Route::get('/user_roles', [UserController::class, 'getUserRoles']);

Route::group([
    "prefix" => "users",
    'middleware' => 'auth:sanctum'
], function () {
    
    Route::group([
        'middleware' => ['role:ADMIN','decode_id']
    ], function () {
        Route::get('/search', [UserController::class, 'search']);
        Route::get('/', [UserController::class, 'index']);
        Route::post('/', [UserController::class, 'store']);
        Route::get('/{id}', [UserController::class, 'show']);
        Route::put('/{id}', [UserController::class, 'update']);
        Route::patch('/{id}', [UserController::class, 'update']);
        Route::delete('/{id}', [UserController::class, 'destroy']);
    });
});

Route::group([
    "prefix" => "public-issues",
    'middleware' => [
        'decode_id', 
        // 'throttle:public_issues'
    ]
], function () {
    Route::get('/', [IssueController::class, 'getPublicIssues']);
    Route::post('/', [IssueController::class, 'storePublicIssue']);
    Route::put('/{id}/close', [IssueController::class, 'closePublicIssue']);
    Route::get('/{id}/files', [IssueController::class, 'getFiles']);
    Route::get('/{id}', [IssueController::class, 'getPublicIssue']);
});

Route::group([
    "prefix" => "issues",
    'middleware' => ['decode_id']
], function () {
    Route::post('/', [IssueController::class, 'store']);
    Route::get('/', [IssueController::class, 'index']);
    Route::get('/{id}/files', [IssueController::class, 'getFiles']);
    Route::get('/{id}/logs', [IssueController::class, 'getIssueLogs']);
    
    Route::group([
        'middleware' => ['role:ADMIN','decode_id', 'auth:sanctum']
    ], function () {
        Route::get('/{id}', [IssueController::class, 'show']);
        Route::put('/{id}', [IssueController::class, 'update']);
        Route::put('/{id}/status', [IssueController::class, 'updateIssueStatus']);
        Route::patch('/{id}', [IssueController::class, 'update']);
        Route::delete('/{id}', [IssueController::class, 'destroy']);
    });
});

Route::group([
    "prefix" => "comments",
    'middleware' => ['decode_id']
], function () {
    Route::post('/', [CommentController::class, 'store']);
    Route::get('/{id}', [CommentController::class, 'show'])->middleware('decode_id');
    Route::post('/{id}/read', [CommentController::class, 'markAsRead'])->middleware('decode_id');
    
    Route::get('/', [CommentController::class, 'index']);
    Route::put('/{id}', [CommentController::class, 'update']);
    Route::patch('/{id}', [CommentController::class, 'update']);
    Route::delete('/{id}', [CommentController::class, 'destroy']);
});

Route::group([
    "prefix" => "tags",
], function () {

    Route::get('/', [TagController::class, 'index']);
    Route::group([
        'middleware' => [
            'role:ADMIN','decode_id',
            'middleware' => 'auth:sanctum'
        ]
    ], function () {
        Route::post('/', [TagController::class, 'store']);
        Route::get('/{id}', [TagController::class, 'show']);
        Route::put('/{id}', [TagController::class, 'update']);
        Route::patch('/{id}', [TagController::class, 'update']);
        Route::delete('/{id}', [TagController::class, 'destroy']);
    });
});

Route::group([
    "prefix" => "teams",
], function () {

    Route::group([
        'middleware' => [
            'role:ADMIN','decode_id',
            'middleware' => 'auth:sanctum'
        ]
    ], function () {
        Route::get('/', [TeamController::class, 'index']);
        Route::post('/', [TeamController::class, 'store']);
        Route::get('/{id}', [TeamController::class, 'show']);
        Route::put('/{id}', [TeamController::class, 'update']);
        Route::patch('/{id}', [TeamController::class, 'update']);
        Route::delete('/{id}', [TeamController::class, 'destroy']);
    });
});