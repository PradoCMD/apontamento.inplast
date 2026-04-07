<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\OrdemProducao;
use Illuminate\Http\Request;

class OrdemProducaoController extends Controller
{
    public function index(Request $request)
    {
        $query = OrdemProducao::with('produto');

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        if ($request->has('prioridade')) {
            $query->where('prioridade', $request->prioridade);
        }

        return response()->json($query->orderBy('prioridade', 'desc')->orderBy('inicio_previsto')->paginate(20));
    }

    public function show(OrdemProducao $ordem)
    {
        return response()->json($ordem->load(['produto', 'apontamentos']));
    }

    public function disponiveis(Request $request)
    {
        $ordens = OrdemProducao::with('produto')
            ->whereIn('status', ['aberta', 'em_producao'])
            ->orderBy('prioridade', 'desc')
            ->orderBy('inicio_previsto')
            ->get();

        return response()->json($ordens);
    }
}