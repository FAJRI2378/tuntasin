<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\SubmissionController;
use App\Http\Controllers\Api\AdminController;
use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\VoteController;

// Public
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);
Route::get('/submissions', [SubmissionController::class, 'index']);
Route::get('/categories', [CategoryController::class, 'index']);

// Protected Auth Routes
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/submissions', [SubmissionController::class, 'store']);
    Route::post('/submissions/{id}/vote', [VoteController::class, 'toggleVote']);

    // Admin Routes
    Route::get('/admin/stats', [AdminController::class, 'stats']);
    Route::put('/admin/submissions/{id}/status', [AdminController::class, 'updateStatus']);

    // CRUD Categories (Admin)
    Route::post('/categories', [CategoryController::class, 'store']);
    Route::put('/categories/{id}', [CategoryController::class, 'update']);
    Route::delete('/categories/{id}', [CategoryController::class, 'destroy']);
});