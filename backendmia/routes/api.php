<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\SubmissionController;
use App\Http\Controllers\Api\AuthController;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

// Auth Routes
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

// Submissions Routes
Route::get('/submissions', [SubmissionController::class, 'index']); // Publik

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/submissions', [SubmissionController::class, 'store']); // Butuh Login/Token
    Route::put('/submissions/{id}', [SubmissionController::class, 'update']);
    Route::delete('/submissions/{id}', [SubmissionController::class, 'destroy']);
});