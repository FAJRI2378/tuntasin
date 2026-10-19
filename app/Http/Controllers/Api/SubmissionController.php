<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreSubmissionRequest;
use App\Http\Resources\SubmissionResource;
use App\Models\Submission;

class SubmissionController extends Controller
{
    public function index()
    {
        $submissions = Submission::with(['categories', 'images', 'user'])->latest()->get();
        return SubmissionResource::collection($submissions);
    }

    public function store(StoreSubmissionRequest $request)
{

    $submission = Submission::create([
        'user_id'     => $request->user_id ?? 1, // Sementara hardcode ID 1 jika belum pakai auth token
        'label'       => $request->label,
        'description' => $request->description,
        'location'    => $request->location,
        'status'      => 'pending',
    ]);

    if ($request->filled('category_name')) {
        $submission->categories()->create([
            'name' => $request->category_name,
        ]);
    }

    // 3. Simpan File Gambar (jika ada upload file 'images')
    if ($request->hasFile('images')) {
        foreach ($request->file('images') as $imageFile) {
            $path = $imageFile->store('submissions', 'public');
            $submission->images()->create([
                'url' => $path,
            ]);
        }
    }

    // Return response JSON yang sudah diformat Resource
    return new SubmissionResource($submission->load(['categories', 'images']));
}
}