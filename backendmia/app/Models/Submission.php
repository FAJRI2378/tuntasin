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
        'category_id',
        'description',
        'location',
        'status',
        'feedback',
    ];
    protected $appends = ['priority_score'];

// Menghitung skor prioritas: Bobot vote lebih tinggi, ditambah status pending/process
public function getPriorityScoreAttribute()
{
    $voteWeight = ($this->votes_count ?? 0) * 3; // Setiap vote bernilai 3 poin
    $statusWeight = $this->status === 'pending' ? 5 : ($this->status === 'process' ? 10 : 1);
    
    return $voteWeight + $statusWeight;
}

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function category()
    {
        return $this->belongsTo(Category::class);
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
