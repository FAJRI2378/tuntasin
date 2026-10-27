<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Submission extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'label',
        'description',
        'location',
        'status',
        'feedback',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function categories()
    {
        return $this->hasMany(Category::class);
    }
    public function votes()
    {
        return $this->hasMany(Vote::class);
    }
    public function images()
    {
        return $this->hasMany(Image::class);
    }
}
