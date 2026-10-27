<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Category extends Model
{
   
    protected $fillable = [
        'name'
    ];

    // Satu kategori bisa dipakai oleh banyak submission (laporan)
    public function submissions()
    {
        return $this->hasMany(Submission::class);
    }
}