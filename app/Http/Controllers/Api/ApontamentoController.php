<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Apontamento;
use App\Models\OrdemProducao;
use App\Models\Maquina;
use App\Models\Produto;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class ApontamentoController extends Controller
{
    public function index(Request $request)
    {
        $query = Apontamento::with(['usuario', 'maquina', 'produto', 'ordemProducao']);

        if ($request->has('data')) {
            $query->whereDate('inicio', $request->data);
        }

        if ($request->has('maquina_id')) {
            $query->where('maquina_id', $request->maquina_id);
        }

        if ($request->has('usuario_id')) {
            $query->where('usuario_id', $request->usuario_id);
        }

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        return response()->json($query->orderByDesc('inicio')->paginate(20));
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'maquina_id' => 'required|exists:maquinas,id',
            'produto_id' => 'required|exists:produtos,id',
            'ordem_producao_id' => 'required|exists:ordens_producao,id',
            'tipo_apontamento' => 'required|in:inicio,fim,producao,perda,parada',
            'quantidade' => 'required|numeric|min:0',
            'unidade' => 'required|string|max:10',
            'observacao' => 'nullable|string',
        ]);

        $validated['usuario_id'] = Auth::id();
        $validated['inicio'] = now();
        $validated['status'] = 'pendente';
        $validated['sincronizado'] = false;

        $apontamento = Apontamento::create($validated);

        return response()->json([
            'message' => 'Apontamento criado com sucesso',
            'data' => $apontamento->load(['usuario', 'maquina', 'produto', 'ordemProducao'])
        ], 201);
    }

    public function show(Apontamento $apontamento)
    {
        return response()->json($apontamento->load(['usuario', 'maquina', 'produto', 'ordemProducao']));
    }

    public function update(Request $request, Apontamento $apontamento)
    {
        $validated = $request->validate([
            'quantidade' => 'sometimes|numeric|min:0',
            'observacao' => 'nullable|string',
            'status' => 'sometimes|in:pendente,confirmado,cancelado',
        ]);

        $apontamento->update($validated);
        $apontamento->sincronizado = false;
        $apontamento->save();

        return response()->json([
            'message' => 'Apontamento atualizado',
            'data' => $apontamento->load(['usuario', 'maquina', 'produto', 'ordemProducao'])
        ]);
    }

    public function destroy(Apontamento $apontamento)
    {
        $apontamento->delete();
        return response()->json(['message' => 'Apontamento excluído']);
    }

    public function iniciarProducao(Request $request)
    {
        $validated = $request->validate([
            'ordem_producao_id' => 'required|exists:ordens_producao,id',
            'maquina_id' => 'required|exists:maquinas,id',
            'produto_id' => 'required|exists:produtos,id',
        ]);

        $apontamento = Apontamento::create([
            'usuario_id' => Auth::id(),
            'ordem_producao_id' => $validated['ordem_producao_id'],
            'maquina_id' => $validated['maquina_id'],
            'produto_id' => $validated['produto_id'],
            'tipo_apontamento' => 'inicio',
            'inicio' => now(),
            'status' => 'em_andamento',
            'sincronizado' => false,
        ]);

        return response()->json([
            'message' => 'Produção iniciada',
            'data' => $apontamento
        ], 201);
    }

    public function finalizarProducao(Request $request, Apontamento $apontamento)
    {
        $validated = $request->validate([
            'quantidade' => 'required|numeric|min:0',
            'unidade' => 'required|string|max:10',
            'observacao' => 'nullable|string',
        ]);

        $apontamento->update([
            'tipo_apontamento' => 'fim',
            'fim' => now(),
            'quantidade' => $validated['quantidade'],
            'unidade' => $validated['unidade'],
            'observacao' => $validated['observacao'] ?? null,
            'status' => 'finalizado',
            'sincronizado' => false,
        ]);

        return response()->json([
            'message' => 'Produção finalizada',
            'data' => $apontamento->load(['usuario', 'maquina', 'produto', 'ordemProducao'])
        ]);
    }

    public function reportarPerda(Request $request)
    {
        $validated = $request->validate([
            'ordem_producao_id' => 'required|exists:ordens_producao,id',
            'maquina_id' => 'required|exists:maquinas,id',
            'produto_id' => 'required|exists:produtos,id',
            'quantidade' => 'required|numeric|min:0',
            'tipo_perda' => 'required|in:material,equipamento,operacional,qualidade',
            'observacao' => 'required|string',
        ]);

        $apontamento = Apontamento::create([
            'usuario_id' => Auth::id(),
            'ordem_producao_id' => $validated['ordem_producao_id'],
            'maquina_id' => $validated['maquina_id'],
            'produto_id' => $validated['produto_id'],
            'tipo_apontamento' => 'perda',
            'quantidade' => $validated['quantidade'],
            'unidade' => 'un',
            'observacao' => "Tipo: {$validated['tipo_perda']}. {$validated['observacao']}",
            'inicio' => now(),
            'status' => 'registrado',
            'sincronizado' => false,
        ]);

        return response()->json([
            'message' => 'Perda registrada',
            'data' => $apontamento
        ], 201);
    }

    public function reportarParada(Request $request)
    {
        $validated = $request->validate([
            'maquina_id' => 'required|exists:maquinas,id',
            'tipo_parada' => 'required|in:manutencao,ajuste,falta_material,falta_produto,outros',
            'observacao' => 'required|string',
        ]);

        $apontamento = Apontamento::create([
            'usuario_id' => Auth::id(),
            'maquina_id' => $validated['maquina_id'],
            'tipo_apontamento' => 'parada',
            'observacao' => "Tipo: {$validated['tipo_parada']}. {$validated['observacao']}",
            'inicio' => now(),
            'status' => 'parada',
            'sincronizado' => false,
        ]);

        return response()->json([
            'message' => 'Parada registrada',
            'data' => $apontamento
        ], 201);
    }

    public function sincronizar()
    {
        $pendentes = Apontamento::where('sincronizado', false)->get();
        
        foreach ($pendentes as $apontamento) {
            // Stub para integração com Sankhya
            $apontamento->sincronizado = true;
            $apontamento->save();
        }

        return response()->json([
            'message' => 'Sincronização realizada',
            'quantidade' => $pendentes->count()
        ]);
    }
}