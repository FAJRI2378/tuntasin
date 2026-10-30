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
        $userId = auth('sanctum')->id(); 
        
        if (!$userId) {
            return response()->json(['message' => 'Unauthorized'], 401);
        }

        $submission = Submission::findOrFail($id);

        // --- Perbaikan: Gunakan '==' agar tipe datanya fleksibel
        if ($submission->user_id == $userId) {
            return response()->json(['message' => 'Anda tidak bisa mendukung laporan Anda sendiri.'], 403);
        }

        // Cek apakah user sudah pernah vote laporan ini
        $existingVote = Vote::where('user_id', $userId)
                            ->where('submission_id', $id)
                            ->first();

        if ($existingVote) {
            // Jika sudah vote, maka cabut (unlike/unvote)
            $existingVote->delete();
            return response()->json(['message' => 'Vote berhasil ditarik!'], 200);
        } else {
            // Jika belum, tambahkan vote baru
            Vote::create([
                'user_id' => $userId,
                'submission_id' => $id
            ]);
            return response()->json(['message' => 'Berhasil memberikan Vote!'], 201);
        }
    }
}