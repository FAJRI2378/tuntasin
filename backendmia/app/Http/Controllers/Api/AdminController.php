<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Submission;
use App\Models\Vote;
use Illuminate\Http\Request;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;

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
            ->first();

        return response()->json([
            'status' => 'success',
            'data' => [
                'total' => $total,
                'pending' => $pending,
                'process' => $process,
                'completed' => $completed,
                'invalid' => $invalid,
                'top_voted' => $topVoted
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

        $submission = Submission::with('user')->findOrFail($id);
        
        $updateData = [
            'status'   => $request->status,
            'feedback' => $request->feedback,
        ];

        if ($request->hasFile('pdf_attachment')) {
            if ($submission->pdf_attachment) {
                Storage::disk('public')->delete($submission->pdf_attachment);
            }
            $path = $request->file('pdf_attachment')->store('pdf_proyek', 'public');
            $updateData['pdf_attachment'] = $path;
        }

        $submission->update($updateData);

        // =======================================================
        // FITUR KIRIM NOTIFIKASI WHATSAPP OTOMATIS (FONNTE API)
        // =======================================================
        try {
            $rawPhone = $submission->user->phone ?? null;

            if ($rawPhone) {
                // Konversi awalan 08xx menjadi 628xx agar sesuai format API Fonnte
                $formattedPhone = preg_replace('/^0/', '62', trim($rawPhone));
                
                $userName = $submission->user->name ?? $submission->user->username ?? 'Warga';
                $statusUpper = strtoupper($request->status);
                
                $pesan = "*TUNTASIN - Update Status Laporan*\n\n"
                       . "Halo *{$userName}*, laporanmu yang berjudul *{$submission->label}* telah diperbarui oleh Admin.\n\n"
                       . "Status Saat Ini: *{$statusUpper}*\n";

                if ($request->feedback) {
                    $pesan .= "Catatan Admin: _{$request->feedback}_\n";
                }

                $pesan .= "\nTerima kasih telah berpartisipasi membangun lingkungan yang lebih baik!";

                $token = config('services.fonnte.token');

                $response = Http::withHeaders([
                    'Authorization' => $token,
                ])->post('https://api.fonnte.com/send', [
                    'target'  => $formattedPhone,
                    'message' => $pesan,
                ]);

                Log::info('Fonnte Response Log', [
                    'target_original'  => $rawPhone,
                    'target_formatted' => $formattedPhone,
                    'http_status'      => $response->status(),
                    'api_response'     => $response->json(),
                ]);
            } else {
                Log::warning("Notifikasi WA dilewati: User ID {$submission->user_id} tidak memiliki nomor telepon.");
            }
        } catch (\Exception $e) {
            Log::error('Gagal kirim notif WA Tuntasin: ' . $e->getMessage());
        }

        return response()->json([
            'status'  => 'success',
            'message' => 'Status dan dokumen berhasil diperbarui',
            'data'    => $submission->load(['category', 'images', 'user'])
        ], 200);
    }

    public function destroy($id)
    {
        $submission = Submission::findOrFail($id);
        
        // Hapus file fisik PDF jika ada
        if ($submission->pdf_attachment) {
            \Storage::disk('public')->delete($submission->pdf_attachment);
        }

        // Hapus data dari database
        $submission->delete();

        return response()->json([
            'status'  => 'success',
            'message' => 'Laporan berhasil dihapus oleh Admin'
        ], 200);
    }
    
    public function exportPdf()
    {
        $submissions = Submission::with(['category', 'user'])->latest()->get();

        $pdf = Pdf::loadView('exports.submissions', ['submissions' => $submissions])
                  ->setPaper('a4', 'landscape');

        return $pdf->download('Laporan_Infrastruktur_Tuntasin.pdf');
    }
}