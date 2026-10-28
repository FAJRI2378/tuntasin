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
        $total = Submission::count();
        $pending = Submission::where('status', 'pending')->count();
        $process = Submission::where('status', 'process')->count();
        $invalid = Submission::where('status', 'invalid')->count();
        $completed = Submission::where('status', 'completed')->count();

        // Cari laporan dengan vote terbanyak (Top Voted) beserta data usernya
        $topVoted = Submission::with('user')
            ->withCount('votes')
            ->orderByDesc('votes_count')
            ->first(); // Mengambil satu data teratas sebagai object tunggal

        return response()->json([
            'status' => 'success',
            'data' => [
                'total' => $total,
                'pending' => $pending,
                'process' => $process,
                'completed' => $completed,
                'invalid' => $invalid,
                'top_voted' => $topVoted // Dikirim ke frontend
            ]
        ], 200);
    }

    // Mengubah status submission oleh admin
    public function updateStatus(Request $request, $id)
    {
        $request->validate([
            'status' => 'required|in:pending,process,completed,invalid'
        ]);

        $submission = Submission::findOrFail($id);
        $submission->update(['status' => $request->status]);

        return response()->json([
            'message' => 'Status submission berhasil diperbarui!',
            'data'    => $submission
        ]);
    }
}