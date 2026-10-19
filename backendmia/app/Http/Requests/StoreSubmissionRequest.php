<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class StoreSubmissionRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
   public function authorize(): bool
{
    return true; // Ubah ke true
}

public function rules(): array
{
    return [
        'label' => 'required|string|max:255',
        'description' => 'required|string',
        'location' => 'required|string',
        'category_name' => 'required|string',
        'images.*' => 'image|mimes:jpeg,png,jpg|max:2048', // Jika ada upload gambar
    ];
}
}
