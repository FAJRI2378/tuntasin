<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Submission;
use Illuminate\Http\Request;

class SubmissionController extends Controller
{
    public function index()
    {
        // Ubah 'categories' menjadi 'category' (karena 1 laporan = 1 kategori master)
        $submissions = Submission::with(['category', 'images', 'user'])
            ->latest()
            ->get();

        return response()->json([
            'status' => 'success',
            'data'   => $submissions
        ], 200);
    }

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

        // 3. Blok kode if($request->filled('categories')) DIHAPUS SEPENUHNYA

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
}