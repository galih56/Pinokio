<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\Api\TeamController;
use App\Http\Controllers\Api\UserRoleController;
use App\Http\Controllers\Api\TagController;
use App\Http\Controllers\Api\IssueController;
use App\Http\Controllers\Api\FormController;
use App\Http\Controllers\Api\TaskController;
use App\Http\Controllers\Api\CommentController;

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




Route::group([
    "prefix" => "users",
    'middleware' => 'auth:sanctum'
], function () {
    Route::get('/search', [UserController::class, 'search']);
    Route::group([
        'middleware' => ['decode_id']
    ], function () {
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
        'middleware' => ['decode_id', 'auth:sanctum']
    ], function () {
        Route::put('/{id}/status', [IssueController::class, 'updateIssueStatus']);
        Route::get('/{id}', [IssueController::class, 'show']);
        Route::put('/{id}', [IssueController::class, 'update']);
        Route::patch('/{id}', [IssueController::class, 'update']);
        Route::delete('/{id}', [IssueController::class, 'destroy']);
    });
});

Route::group([
    "prefix" => "form-guard",
    'middleware' => [
        'decode_id',
    ]
], function () {
    Route::get('/{id}', [FormController::class, 'getFormWithLayout']);
    Route::post('/{id}/responses', [FormController::class, 'storeFormResponse']);
});

Route::group([
    "prefix" => "forms",
], function () {
    Route::get('/', [FormController::class, 'index']);
    Route::group([
        'middleware' => [
            'decode_id',
            'middleware' => 'auth:sanctum'
        ]
    ], function () {
        Route::post('/', [FormController::class, 'store']);
        Route::post('/{id}/generate-link', [FormController::class, 'generateLink']);
        Route::get('/{id}/layout', [FormController::class, 'getFormWithLayout']);
        Route::post('/{id}/layout', [FormController::class, 'updateFormLayout']);
        Route::get('/{id}/responses', [FormController::class, 'getFormResponses']);
        Route::get('/{id}/responses/export', [FormController::class, 'export']);
        Route::get('/{id}', [FormController::class, 'show']);
        Route::put('/{id}', [FormController::class, 'update']);
        Route::patch('/{id}', [FormController::class, 'update']);
        Route::delete('/{id}', [FormController::class, 'destroy']);
    });
});

Route::group([
    "prefix" => "tasks",
    'middleware' => ['decode_id', 'auth:sanctum']
], function () {
    Route::post('/', [TaskController::class, 'store']);
    Route::get('/', [TaskController::class, 'index']);
    Route::get('/{id}/files', [TaskController::class, 'getFiles']);
    Route::get('/{id}/logs', [TaskController::class, 'getTaskLogs']);
    Route::get('/{id}', [TaskController::class, 'show']);
    Route::put('/{id}', [TaskController::class, 'update']);
    Route::put('/{id}/status', [TaskController::class, 'updateTaskStatus']);
    Route::patch('/{id}', [TaskController::class, 'update']);
    Route::delete('/{id}', [TaskController::class, 'destroy']);
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
            'decode_id',
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
    'middleware' => 'auth:sanctum'
], function () {
    Route::get('/', [TeamController::class, 'index']);
    Route::post('/', [TeamController::class, 'store']);

    Route::group([
        'middleware' => [
            'decode_id',
        ]
    ], function () {
        Route::get('/{id}', [TeamController::class, 'show']);
        Route::put('/{id}/members', [TeamController::class, 'updateMembers']);
        Route::put('/{id}', [TeamController::class, 'update']);
        Route::patch('/{id}', [TeamController::class, 'update']);
        Route::delete('/{id}', [TeamController::class, 'destroy']);
    });
});


Route::group([
    "prefix" => "user_roles",
    'middleware' => [
        
        'auth:sanctum'
    ]
], function () {
    Route::get('/', [UserRoleController::class, 'index']);
    Route::get('/search', [UserRoleController::class, 'search']);
    Route::post('/', [UserRoleController::class, 'store']);
    Route::group([
        'middleware' => [
            'decode_id',
        ]
    ], function () {
        Route::get('/{id}', [UserRoleController::class, 'show']);
        Route::put('/{id}', [UserRoleController::class, 'update']);
        Route::patch('/{id}', [UserRoleController::class, 'update']);
        Route::delete('/{id}', [UserRoleController::class, 'destroy']);
    });
});