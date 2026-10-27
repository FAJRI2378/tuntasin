<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Vote;
use Illuminate\Http\Request;

class VoteController extends Controller
{
    public function toggleVote($submissionId)
    {
        $userId = auth()->id();
        if (!$userId) {
            return response()->json(['message' => 'Unauthorized'], 401);
        }

        $existingVote = Vote::where('user_id', $userId)
            ->where('submission_id', $submissionId)
            ->first();

        if ($existingVote) {
            $existingVote->delete();
            return response()->json(['message' => 'Dukungan dicabut', 'voted' => false]);
        } else {
            Vote::create([
                'user_id'       => $userId,
                'submission_id' => $submissionId
            ]);
            return response()->json(['message' => 'Berhasil mendukung laporan!', 'voted' => true]);
        }
    }
}