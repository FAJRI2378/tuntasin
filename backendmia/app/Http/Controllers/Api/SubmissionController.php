<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Submission;
use Illuminate\Http\Request;

class SubmissionController extends Controller
{
    public function index()
    {
        $submissions = Submission::with(['categories', 'images', 'user'])
            ->latest()
            ->get();

        return response()->json([
            'status' => 'success',
            'data'   => $submissions
        ], 200);
    }

    public function store(Request $request)
    {
        // 1. Validasi Request
        $request->validate([
            'label'       => 'required|string|max:255',
            'description' => 'required|string',
            'location'    => 'required|string|max:255',
            'categories'  => 'nullable|string',
            'images'      => 'nullable|array',
            'images.*'    => 'image|mimes:jpeg,png,jpg,webp|max:2048',
        ]);

        // 2. Ambil user yang sedang aktif login lewat token Sanctum
        $userId = auth()->id();
        if (!$userId) {
            return response()->json([
                'message' => 'Unauthorized. Silakan login terlebih dahulu.'
            ], 401);
        }

        // 3. Simpan Data Utama Submission
        $submission = Submission::create([
            'user_id'     => $userId,
            'label'       => $request->label,
            'description' => $request->description,
            'location'    => $request->location,
            'status'      => 'pending',
        ]);

        // 4. Simpan Kategori (jika dikirim dari frontend dipisah koma)
        if ($request->filled('categories')) {
            $categoriesList = explode(',', $request->categories);
            foreach ($categoriesList as $catName) {
                $cleanCatName = trim($catName);
                if (!empty($cleanCatName)) {
                    $submission->categories()->create([
                        'name' => $cleanCatName,
                    ]);
                }
            }
        } else {
            $submission->categories()->create([
                'name' => 'Umum',
            ]);
        }

        // 5. Simpan Gambar ke Storage
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
            'data'    => $submission->load(['categories', 'images', 'user'])
        ], 201);
    }
}