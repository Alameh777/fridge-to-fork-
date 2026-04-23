<?php

use App\Http\Controllers\Api\AdminController;
use App\Http\Controllers\Api\AiController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\CommentController;
use App\Http\Controllers\Api\CommunityController;
use App\Http\Controllers\Api\ProfileController;
use App\Http\Controllers\Api\RecipeController;
use Illuminate\Support\Facades\Route;

// Public auth routes
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

// Public recipe library
Route::get('/recipes', [RecipeController::class, 'index']);
Route::get('/recipes/{recipe}', [RecipeController::class, 'show']);
Route::post('/recipes/{recipe}/like', [RecipeController::class, 'like']);

// Public community
Route::get('/community', [CommunityController::class, 'index']);
Route::get('/community/{post}', [CommunityController::class, 'show']);
Route::get('/community/{post}/comments', [CommentController::class, 'index']);

// Protected routes
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);

    // Profile
    Route::get('/profile', [ProfileController::class, 'show']);
    Route::put('/profile', [ProfileController::class, 'update']);

    // AI features
    Route::post('/ai/scan', [AiController::class, 'scanFridge']);
    Route::post('/ai/generate', [AiController::class, 'generateRecipes']);

    // Recipe actions
    Route::post('/recipes', [RecipeController::class, 'store']);
    Route::post('/recipes/{recipe}/save', [RecipeController::class, 'save']);
    Route::delete('/recipes/{recipe}/save', [RecipeController::class, 'unsave']);
    Route::get('/saved-recipes', [RecipeController::class, 'saved']);

    // Community actions
    Route::get('/my-posts', [CommunityController::class, 'myPosts']);
    Route::post('/community', [CommunityController::class, 'store']);
    Route::post('/community/{post}/like', [CommunityController::class, 'like']);
    Route::delete('/community/{post}', [CommunityController::class, 'destroy']);

    // Comments
    Route::post('/community/{post}/comments', [CommentController::class, 'store']);
    Route::delete('/community/{post}/comments/{comment}', [CommentController::class, 'destroy']);
});

// Admin routes
Route::middleware(['auth:sanctum', 'admin'])->prefix('admin')->group(function () {
    Route::get('/stats', [AdminController::class, 'stats']);
    Route::get('/users', [AdminController::class, 'users']);
    Route::delete('/users/{user}', [AdminController::class, 'deleteUser']);
    Route::get('/posts', [AdminController::class, 'posts']);
    Route::delete('/posts/{post}', [AdminController::class, 'deletePost']);
    Route::get('/posts/{post}/comments', [AdminController::class, 'postComments']);
    Route::delete('/comments/{comment}', [AdminController::class, 'deleteComment']);
});
