<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Category extends Model
{
    protected $fillable = [
        'submission_id', 
        'name'
    ];

    public function submission()
    {
        return $this->belongsTo(Submission::class);
    }
}