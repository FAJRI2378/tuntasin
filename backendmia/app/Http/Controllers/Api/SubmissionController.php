<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Submission;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage; // Tambahkan untuk mempermudah hapus gambar

class SubmissionController extends Controller
{
    // ==========================================
    // MENGAMBIL SEMUA LAPORAN
    // ==========================================
    public function index()
    {
        // Ambil ID user yang sedang login via token
        $userId = auth('sanctum')->id();

        $submissions = Submission::with(['user', 'category', 'images']) // Sesuaikan relasi kamu
            ->withCount('votes') // Menghitung total vote
            ->when($userId, function ($query) use ($userId) {
                // Mengecek apakah user yang login sudah vote laporan ini
                // Akan menghasilkan boolean true/false di properti 'has_voted'
                $query->withExists(['votes as has_voted' => function ($q) use ($userId) {
                    $q->where('user_id', $userId);
                }]);
            })
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'status' => 'success',
            'data' => $submissions
        ], 200);
    }

    // ==========================================
    // MEMBUAT LAPORAN BARU
    // ==========================================
    public function store(Request $request)
    {
        // 1. Validasi Request (Ubah validasi dari string menjadi category_id)
        $request->validate([
            'label'       => 'required|string|max:255',
            'description' => 'required|string',
            'location'    => 'required|string|max:255',
            'category_id' => 'required|exists:categories,id', // Harus memilih ID kategori yang ada
            'images'      => 'nullable|array',
            'images.*'    => 'image|mimes:jpeg,png,jpg,webp|max:2048',
        ]);

        $userId = auth()->id();
        if (!$userId) {
            return response()->json([
                'message' => 'Unauthorized. Silakan login terlebih dahulu.'
            ], 401);
        }

        // 2. Simpan Data Utama Submission (Termasuk category_id)
        $submission = Submission::create([
            'user_id'     => $userId,
            'category_id' => $request->category_id,
            'label'       => $request->label,
            'description' => $request->description,
            'location'    => $request->location,
            'status'      => 'pending',
        ]);

        // 4. Simpan Gambar ke Storage
        if ($request->hasFile('images')) {
            foreach ($request->file('images') as $file) {
                $path = $file->store('submissions', 'public');
                $submission->images()->create([
                    'url' => $path,
                ]);
            }
        }

        return response()->json([
            'message' => 'Submission berhasil dibuat!',
            'data'    => $submission->load(['category', 'images', 'user'])
        ], 201);
    }

    // ==========================================
    // MENAMPILKAN DETAIL LAPORAN (UNTUK EDIT)
    // ==========================================
    public function show($id)
    {
        $submission = Submission::with(['category', 'images', 'user'])->findOrFail($id);

        return response()->json([
            'status' => 'success',
            'data' => $submission
        ], 200);
    }

    // ==========================================
    // MENGUPDATE DATA LAPORAN
    // ==========================================
    public function update(Request $request, $id)
    {
        $submission = Submission::findOrFail($id);
        $userId = auth('sanctum')->id();

        // Validasi kepemilikan (hanya pembuat laporan yang boleh mengedit)
        if ($submission->user_id != $userId) {
            return response()->json([
                'message' => 'Unauthorized. Anda tidak berhak mengedit laporan ini.'
            ], 403);
        }

        $request->validate([
            'label'       => 'required|string|max:255',
            'description' => 'required|string',
            'location'    => 'required|string|max:255',
            'category_id' => 'required|exists:categories,id',
        ]);

        $submission->update([
            'category_id' => $request->category_id,
            'label'       => $request->label,
            'description' => $request->description,
            'location'    => $request->location,
        ]);

        return response()->json([
            'message' => 'Laporan berhasil diperbarui!',
            'data'    => $submission->load(['category', 'images', 'user'])
        ], 200);
    }

    // ==========================================
    // MENGHAPUS LAPORAN
    // ==========================================
    public function destroy($id)
    {
        $submission = Submission::findOrFail($id);
        $userId = auth('sanctum')->id();

        // Validasi kepemilikan (hanya pembuat laporan yang boleh menghapus)
        if ($submission->user_id != $userId) {
            return response()->json([
                'message' => 'Unauthorized. Anda tidak berhak menghapus laporan ini.'
            ], 403);
        }

        // Hapus gambar terkait dari storage jika perlu, lalu hapus submission
        foreach ($submission->images as $image) {
            // Hapus file fisik jika disimpan di public disk
            Storage::disk('public')->delete($image->url);
            $image->delete();
        }

        $submission->delete();

        return response()->json([
            'status' => 'success',
            'message' => 'Laporan berhasil dihapus!'
        ], 200);
    }

    // ==========================================
    // API STATISTIK UNTUK LANDING PAGE
    // ==========================================
   public function landingStats()
{
    // Fungsi helper untuk menyingkat angka (misal: 1500 -> 1.5K)
    $formatNumber = function($num) {
        if($num >= 1000) return round($num/1000, 1) . 'K';
        return (string) $num;
    };

    // Hitung total dari database
    $totalLaporan = Submission::count();

    // Ubah 'selesai' menjadi 'completed' (atau sesuaikan dengan isi database Anda)
    $laporanSelesai = Submission::where('status', 'completed')->count(); 

    $totalDukungan = \App\Models\Vote::count(); 

    return response()->json([
        'total_laporan' => $formatNumber($totalLaporan),
        'laporan_selesai' => $formatNumber($laporanSelesai),
        'total_dukungan' => $formatNumber($totalDukungan),
        'rata_rata_respons' => '1-3 hari'
    ]);
}
}