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
        // 1. Validasi input dari frontend (NIK dan Phone sudah masuk)
        $request->validate([
            'nik'      => 'required|string|unique:users',
            'username' => 'required|string',
            'email'    => 'required|email|unique:users',
            'phone'    => 'required|string', 
            'password' => 'required|min:6',
        ]);

        // 2. Simpan user baru ke database
        $user = User::create([
            'nik'      => $request->nik,
            'username' => $request->username,
            'email'    => $request->email,
            'phone'    => $request->phone, 
            'password' => Hash::make($request->password),
            'role'     => 'user', // Otomatis menjadi 'user' biasa
        ]);

        // 3. Buat token Sanctum untuk sesi login otomatis
        $token = $user->createToken('auth_token')->plainTextToken;

        // 4. Kembalikan respons JSON ke frontend
        return response()->json([
            'message' => 'Registrasi berhasil!',
            'token'   => $token,
            'user'    => [
                'id'       => $user->id,
                'name'     => $user->username,
                'email'    => $user->email,
                'phone'    => $user ->phone,
                'nik'      => $user->nik,
                'role'     => $user->role, 
            ]
        ], 200);
    }

    public function login(Request $request)
    {
        $request->validate([
            'email'    => 'required|email',
            'password' => 'required',
        ]);

        $user = User::where('email', $request->email)->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            return response()->json([
                'message' => 'Email atau password salah.'
            ], 401);
        }

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'message' => 'Login berhasil!',
            'token'   => $token,
            'user'    => [
                'id'       => $user->id,
                'name'     => $user->username,
                'email'    => $user->email,
                'nik'      => $user->nik,
                'role'     => $user->role, 
            ]
        ], 200);
    }

    public function checkUser(Request $request)
    {
        $user = $request->user();

        if ($user->role !== 'admin') {
            return response()->json([
                'valid' => true,
                'is_admin' => false,
                'message' => 'Token valid, tetapi Anda bukan admin.'
            ], 200);
        }

        return response()->json([
            'valid' => true,
            'is_admin' => true,
            'message' => 'Akses diizinkan.'
        ], 200);
    }
}