<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\SubmissionController;
use App\Http\Controllers\Api\AdminController;
use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\VoteController;
use Illuminate\Support\Facades\Route;

// ==========================================
// PUBLIC ROUTES (Bisa diakses tanpa login)
// ==========================================
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);
Route::get('/submissions', [SubmissionController::class, 'index']);
Route::get('/categories', [CategoryController::class, 'index']);
Route::get('/landing-stats', [SubmissionController::class, 'landingStats']); 

// ==========================================
// PROTECTED ROUTES (Hanya untuk user yang login)
// ==========================================
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/check', [AuthController::class, 'checkUser']);

    Route::prefix("/submissions")->group(function () {
        Route::post('/', [SubmissionController::class, 'store']);
        Route::get('/{id}', [SubmissionController::class, 'show']);     // Ambil detail data untuk edit
        Route::put('/{id}', [SubmissionController::class, 'update']);    // Simpan perubahan edit
        Route::delete('/{id}', [SubmissionController::class, 'destroy']);// Hapus laporan oleh User
        Route::post('/{id}/vote', [VoteController::class, 'toggleVote']);
    });

    // Pindahkan POST kategori ke sini agar warga/user biasa bisa menambah kategori baru saat laporan
    Route::post('/categories', [CategoryController::class, 'store']);

    // ==========================================
    // ADMIN ROUTES (Hanya untuk Admin)
    // ==========================================
    Route::middleware('admin')->group(function () {
        
        // Admin Stats, Status, Hapus Paksa & Export
        Route::prefix("/admin")->group(function () {
            Route::get('/stats', [AdminController::class, 'stats']);
            Route::post('/submissions/{id}/status', [AdminController::class, 'updateStatus']);
            Route::delete('/submissions/{id}', [AdminController::class, 'destroy']);
            
            // --- TAMBAHAN BARU: Route untuk Admin Export PDF ---
            Route::get('/export-pdf', [AdminController::class, 'exportPdf']);
        });

        // CRUD Categories khusus Admin (Update & Delete)
        Route::prefix("/categories")->group(function () {
            Route::put('/{id}', [CategoryController::class, 'update']);
            Route::delete('/{id}', [CategoryController::class, 'destroy']);
        });
    });
});