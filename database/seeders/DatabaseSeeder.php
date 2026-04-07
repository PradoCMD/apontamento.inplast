<?php

namespace Database\Seeders;

use App\Models\Usuario;
use App\Models\Maquina;
use App\Models\Produto;
use App\Models\OrdemProducao;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $usuario = Usuario::create([
            'codigo' => '001',
            'nome' => 'Operador Teste',
            'email' => 'operador@inplast.com.br',
            'password' => Hash::make('123456'),
            'tipo' => 'operador',
            'ativo' => true,
        ]);

        $supervisor = Usuario::create([
            'codigo' => '999',
            'nome' => 'Supervisor',
            'email' => 'supervisor@inplast.com.br',
            'password' => Hash::make('123456'),
            'tipo' => 'supervisor',
            'ativo' => true,
        ]);

        $maquinas = [
            ['codigo' => 'M01', 'nome' => 'Extrusora 1', 'tipo' => 'Extrusão', 'localizacao' => 'Setor A', 'status' => 'disponivel'],
            ['codigo' => 'M02', 'nome' => 'Extrusora 2', 'tipo' => 'Extrusão', 'localizacao' => 'Setor A', 'status' => 'disponivel'],
            ['codigo' => 'M03', 'nome' => 'Injetora 1', 'tipo' => 'Injeção', 'localizacao' => 'Setor B', 'status' => 'disponivel'],
            ['codigo' => 'M04', 'nome' => 'Injetora 2', 'tipo' => 'Injeção', 'localizacao' => 'Setor B', 'status' => 'em_producao'],
            ['codigo' => 'M05', 'nome' => 'Termoformadora', 'tipo' => 'Termoformagem', 'localizacao' => 'Setor C', 'status' => 'disponivel'],
            ['codigo' => 'M06', 'nome' => 'Corte', 'tipo' => 'Corte', 'localizacao' => 'Setor D', 'status' => 'manutencao'],
        ];

        foreach ($maquinas as $m) {
            Maquina::create($m);
        }

        $produtos = [
            ['codigo' => 'P001', 'nome' => 'Tampa PP 30mm', 'unidade' => 'un', 'familia' => 'Tampas', 'ativo' => true],
            ['codigo' => 'P002', 'nome' => 'Copa 500ml', 'unidade' => 'un', 'familia' => 'Copas', 'ativo' => true],
            ['codigo' => 'P003', 'nome' => 'Pote 1L', 'unidade' => 'un', 'familia' => 'Potes', 'ativo' => true],
            ['codigo' => 'P004', 'nome' => 'Filme PVC 30cm', 'unidade' => 'kg', 'familia' => 'Filmes', 'ativo' => true],
            ['codigo' => 'P005', 'nome' => 'Sacochete', 'unidade' => 'un', 'familia' => 'Sacolas', 'ativo' => true],
        ];

        foreach ($produtos as $p) {
            $produto = Produto::create($p);
            
            OrdemProducao::create([
                'codigo' => 'OP-2026-' . rand(1000, 9999),
                'produto_id' => $produto->id,
                'quantidade_prevista' => rand(1000, 5000),
                'inicio_previsto' => now(),
                'fim_previsto' => now()->addDays(3),
                'status' => ['aberta', 'em_producao'][rand(0, 1)],
                'prioridade' => ['baixa', 'media', 'alta'][rand(0, 2)],
            ]);
        }
    }
}