<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class SubmissionResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
   public function toArray($request): array
{
    return [
        'id' => $this->id,
        'label' => $this->label,
        'description' => $this->description,
        'location' => $this->location,
        'status' => $this->status,
        'feedback' => $this->feedback,
        'categories' => $this->categories,
        'images' => $this->images,
        'created_at' => $this->created_at->format('Y-m-d H:i:s'),
    ];
}
}
