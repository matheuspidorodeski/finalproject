<?php
use App\Http\Controllers\Api\{AuthController, PostController, CommentController, LikeController, FollowController, UserController};
use Illuminate\Support\Facades\Route;

Route::post('register', [AuthController::class, 'register']);
Route::post('login', [AuthController::class, 'login']);

Route::middleware('auth:sanctum')->group(function () {
    Route::post('logout', [AuthController::class, 'logout']);
    Route::get('me', [UserController::class, 'me']);
    Route::put('me', [UserController::class, 'update']);
    Route::get('users', [UserController::class, 'search']);
    Route::get('users/{id}', [UserController::class, 'show']);
    Route::post('users/{id}/follow', [FollowController::class, 'store']);
    Route::delete('users/{id}/follow', [FollowController::class, 'destroy']);
    Route::get('posts', [PostController::class, 'index']);
    Route::post('posts', [PostController::class, 'store']);
    Route::get('posts/{id}', [PostController::class, 'show']);
    Route::delete('posts/{id}', [PostController::class, 'destroy']);
    Route::post('posts/{id}/like', [LikeController::class, 'toggle']);
    Route::get('posts/{id}/comments', [CommentController::class, 'index']);
    Route::post('posts/{id}/comments', [CommentController::class, 'store']);
});