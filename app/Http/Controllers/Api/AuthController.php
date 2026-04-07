<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Usuario;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Laravel\Sanctum\HasApiTokens;

class AuthController extends Controller
{
    public function login(Request $request)
    {
        $request->validate([
            'codigo' => 'required|string',
            'password' => 'required|string',
        ]);

        $usuario = Usuario::where('codigo', $request->codigo)->first();

        if (!$usuario || !Hash::check($request->password, $usuario->password)) {
            return response()->json(['message' => 'Credenciais inválidas'], 401);
        }

        $token = $usuario->createToken('apontamento-mobile')->plainTextToken;

        return response()->json([
            'token' => $token,
            'usuario' => $usuario,
        ]);
    }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();
        return response()->json(['message' => 'Logout realizado']);
    }

    public function me(Request $request)
    {
        return response()->json($request->user());
    }
}