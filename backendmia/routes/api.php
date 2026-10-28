<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\SubmissionController;
use App\Http\Controllers\Api\AdminController;
use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\VoteController;
use Illuminate\Support\Facades\Route;

// Public
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);
Route::get('/submissions', [SubmissionController::class, 'index']);
Route::get('/categories', [CategoryController::class, 'index']);

// Protected Auth Routes
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/is-admin', [AuthController::class, 'checkIsAdmin']);

    Route::prefix("/submissions")->group(function () {
        Route::post('/', [SubmissionController::class, 'store']);
        Route::post('/{id}/vote', [VoteController::class, 'toggleVote']);
    });

    // Admin Routes
    Route::prefix("/admin")->group(function () {
        Route::get('/stats', [AdminController::class, 'stats']);
        Route::put('/submissions/{id}/status', [AdminController::class, 'updateStatus']);
    });

    // CRUD Categories (Admin)
    Route::prefix("/categories")->group(function () {
        Route::post('/', [CategoryController::class, 'store']);
        Route::put('/{id}', [CategoryController::class, 'update']);
        Route::delete('/{id}', [CategoryController::class, 'destroy']);
    });
});
