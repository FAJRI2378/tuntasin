<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        
      User::create([
    'nik'      => '3171000000000001',
    'username' => 'admin_tuntasin',
    'email'    => 'admin@tuntasin.id',
    'phone'    => null,
    'password' => Hash::make('admin123'),
    'role'     => 'admin',
]);

    }
}