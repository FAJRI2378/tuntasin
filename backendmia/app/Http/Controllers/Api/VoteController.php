<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Submission;
use App\Models\Vote;
use Illuminate\Http\Request;

class VoteController extends Controller
{
    public function togglevote($id)
    {
        // Pastikan pakai guard sanctum jika ini API
        // Ambil data user secara utuh (bukan hanya ID) agar bisa mengecek role
        $user = auth('sanctum')->user(); 
        
        if (!$user) {
            return response()->json(['message' => 'Unauthorized'], 401);
        }

        // --- BLOKIR ADMIN ---
        // Cek apakah user adalah admin (sesuaikan dengan nama kolom di database Anda, misal: 'role' atau 'is_admin')
        if ($user->role === 'admin' || $user->is_admin == true) {
            return response()->json(['message' => 'Admin tidak diperbolehkan memberikan vote.'], 403);
        }

        $submission = Submission::findOrFail($id);

        if ($submission->user_id == $user->id) {
            return response()->json(['message' => 'Anda tidak bisa mendukung laporan Anda sendiri.'], 403);
        }

        // Cek apakah user sudah pernah vote laporan ini
        $existingVote = Vote::where('user_id', $user->id)
                            ->where('submission_id', $id)
                            ->first();

        if ($existingVote) {
            // Jika sudah vote, maka cabut (unlike/unvote)
            $existingVote->delete();
            return response()->json(['message' => 'Vote berhasil ditarik!'], 200);
        } else {
            // Jika belum, tambahkan vote baru
            Vote::create([
                'user_id' => $user->id,
                'submission_id' => $id
            ]);
            return response()->json(['message' => 'Berhasil memberikan Vote!'], 201);
        }
    }
}