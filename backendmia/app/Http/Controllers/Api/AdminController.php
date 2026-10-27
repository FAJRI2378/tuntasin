<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Submission;
use App\Models\Vote;
use Illuminate\Http\Request;

class AdminController extends Controller
{
    // Mengambil statistik & top voted submission
    public function stats()
    {
        $pending   = Submission::where('status', 'pending')->count();
        $process   = Submission::where('status', 'process')->count();
        $completed = Submission::where('status', 'completed')->count();
        $total     = Submission::count();

        // Ambil submission dengan vote terbanyak
        $topVoted = Submission::withCount('votes')
            ->with(['user', 'categories', 'images'])
            ->orderBy('votes_count', 'desc')
            ->first();

        return response()->json([
            'status' => 'success',
            'data'   => [
                'pending'   => $pending,
                'process'   => $process,
                'completed' => $completed,
                'total'     => $total,
                'top_voted' => $topVoted
            ]
        ], 200);
    }

    // Mengubah status submission oleh admin
    public function updateStatus(Request $request, $id)
    {
        $request->validate([
            'status' => 'required|in:pending,process,completed,rejected'
        ]);

        $submission = Submission::findOrFail($id);
        $submission->update(['status' => $request->status]);

        return response()->json([
            'message' => 'Status submission berhasil diperbarui!',
            'data'    => $submission
        ]);
    }
}