<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Maquina;
use Illuminate\Http\Request;

class MaquinaController extends Controller
{
    public function index(Request $request)
    {
        $query = Maquina::query();

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        if ($request->has('tipo')) {
            $query->where('tipo', $request->tipo);
        }

        return response()->json($query->orderBy('nome')->get());
    }
}