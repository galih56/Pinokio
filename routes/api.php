<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\api\AuthController;
use App\Http\Controllers\api\UserController;
use App\Http\Controllers\api\TagController;
use App\Http\Controllers\api\IssueController;

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
        'middleware' => ['role:ADMIN,HR','decode_id']
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
    "prefix" => "issues",
], function () {
    Route::post('/', [IssueController::class, 'store']);
    
    Route::group([
        'middleware' => ['role:ADMIN,HR','decode_id', 'auth:sanctum']
    ], function () {
        Route::get('/', [IssueController::class, 'index']);
        Route::get('/{id}', [IssueController::class, 'show']);
        Route::put('/{id}', [IssueController::class, 'update']);
        Route::patch('/{id}', [IssueController::class, 'update']);
        Route::delete('/{id}', [IssueController::class, 'destroy']);
    });
});

Route::group([
    "prefix" => "tags",
], function () {

    Route::get('/', [TagController::class, 'index']);
    Route::group([
        'middleware' => [
            'role:ADMIN,HR','decode_id',
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
