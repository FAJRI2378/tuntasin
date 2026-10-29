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

   public function updateStatus(Request $request, $id)
{
    $request->validate([
        'status'         => 'required|in:pending,process,invalid,completed',
        'feedback'       => 'nullable|string', 
        'pdf_attachment' => 'nullable|file|mimes:pdf|max:10240', // Maksimal 10MB
    ]);

    $submission = Submission::findOrFail($id);
    
    $updateData = [
        'status'   => $request->status,
        'feedback' => $request->feedback,
    ];

    if ($request->hasFile('pdf_attachment')) {
        if ($submission->pdf_attachment) {
            \Storage::disk('public')->delete($submission->pdf_attachment);
        }
        $path = $request->file('pdf_attachment')->store('pdf_proyek', 'public');
        $updateData['pdf_attachment'] = $path;
    }

    $submission->update($updateData);

    return response()->json([
        'status'  => 'success',
        'message' => 'Status dan dokumen berhasil diperbarui',
        'data'    => $submission->load(['category', 'images', 'user'])
    ], 200);
}
}