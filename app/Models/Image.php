<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Image extends Model
{
    use HasFactory;

    protected $fillable = ['submission_id', 'url'];

    public function submission()
    {
        return $this->belongsTo(Submission::class);
    }
}
