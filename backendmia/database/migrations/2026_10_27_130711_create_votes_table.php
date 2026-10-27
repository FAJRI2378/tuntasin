<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('votes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->foreignId('submission_id')->constrained()->onDelete('cascade');
            $table->timestamps();

            // Mencegah 1 user melakukan vote ganda pada submission yang sama
            $table->unique(['user_id', 'submission_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('votes');
    }
};