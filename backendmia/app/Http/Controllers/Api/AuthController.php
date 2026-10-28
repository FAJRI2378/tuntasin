<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class AuthController extends Controller
{
    public function register(Request $request)
    {
        // 1. Validasi input dari frontend
        $request->validate([
            'nik'      => 'required|string|unique:users,nik',
            'username' => 'required|string|max:255',
            'email'    => 'required|string|email|max:255|unique:users,email',
            'password' => 'required|string|min:6',
        ]);

        // 2. Simpan user baru ke database
        $user = User::create([
            'nik'      => $request->nik,
            'username' => $request->username,
            'email'    => $request->email,
            'password' => Hash::make($request->password),
        ]);

        // 3. Buat token Sanctum untuk user
        $token = $user->createToken('auth_token')->plainTextToken;

        // 4. Kembalikan respons JSON ke frontend
        return response()->json([
            'message' => 'Login berhasil!',
            'token'   => $token,
            'user'    => [
                'id'       => $user->id,
                'name'     => $user->username,
                'email'    => $user->email,
                'nik'      => $user->nik,
                'role'     => $user->role, // TAMBAHKAN BARIS INI
            ]
        ], 200);
    }

    public function login(Request $request)
    {
        // 1. Validasi input login
        $request->validate([
            'email'    => 'required|email',
            'password' => 'required',
        ]);

        // 2. Cari user berdasarkan email
        $user = User::where('email', $request->email)->first();

        // 3. Cek apakah user ada dan password-nya cocok
        if (!$user || !Hash::check($request->password, $user->password)) {
            return response()->json([
                'message' => 'Email atau password salah.'
            ], 401);
        }

        // 4. Buat token Sanctum baru untuk sesi login ini
        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'message' => 'Login berhasil!',
            'token'   => $token,
            'user'    => [
                'id'       => $user->id,
                'name'     => $user->username,
                'email'    => $user->email,
                'nik'      => $user->nik,
                'role'     => $user->role, // TAMBAHKAN BARIS INI
            ]
        ], 200);
    }

    public function checkIsAdmin(Request $request)
    {
        $user = $request->user();

        $isAdmin = $user && $user->role === 'admin';

        return response()->json([
            'is_admin' => $isAdmin,
        ]);
    }
}
