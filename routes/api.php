<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\ApontamentoController;
use App\Http\Controllers\Api\OrdemProducaoController;
use App\Http\Controllers\Api\MaquinaController;
use App\Http\Controllers\Api\ProdutoController;

Route::post('/auth/login', [AuthController::class, 'login']);
Route::post('/auth/logout', [AuthController::class, 'logout']);
Route::get('/auth/me', [AuthController::class, 'me']);

Route::middleware('auth:sanctum')->group(function () {
    Route::apiResource('apontamentos', ApontamentoController::class);
    Route::post('/apontamentos/iniciar', [ApontamentoController::class, 'iniciarProducao']);
    Route::post('/apontamentos/{apontamento}/finalizar', [ApontamentoController::class, 'finalizarProducao']);
    Route::post('/apontamentos/perda', [ApontamentoController::class, 'reportarPerda']);
    Route::post('/apontamentos/parada', [ApontamentoController::class, 'reportarParada']);
    Route::post('/apontamentos/sincronizar', [ApontamentoController::class, 'sincronizar']);

    Route::get('/ordens-producao', [OrdemProducaoController::class, 'index']);
    Route::get('/ordens-producao/{ordem}', [OrdemProducaoController::class, 'show']);
    Route::get('/ordens-producao/{ordem}/disponiveis', [OrdemProducaoController::class, 'disponiveis']);

    Route::get('/maquinas', [MaquinaController::class, 'index']);
    Route::get('/produtos', [ProdutoController::class, 'index']);
});

Route::get('/sync/status', [ApontamentoController::class, 'sincronizar']);