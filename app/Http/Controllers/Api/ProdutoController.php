<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Produto;
use Illuminate\Http\Request;

class ProdutoController extends Controller
{
    public function index(Request $request)
    {
        $query = Produto::query();

        if ($request->has('familia')) {
            $query->where('familia', $request->familia);
        }

        if ($request->has('ativo')) {
            $query->where('ativo', $request->ativo === 'true');
        }

        return response()->json($query->orderBy('nome')->get());
    }
}