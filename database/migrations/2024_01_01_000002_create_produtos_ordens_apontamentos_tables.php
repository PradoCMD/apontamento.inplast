<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('produtos', function (Blueprint $table) {
            $table->id();
            $table->string('codigo')->unique();
            $table->string('nome');
            $table->text('descricao')->nullable();
            $table->string('unidade', 10)->default('un');
            $table->string('familia')->nullable();
            $table->boolean('ativo')->default(true);
            $table->string('sankhya_id')->nullable();
            $table->timestamps();
        });

        Schema::create('ordens_producao', function (Blueprint $table) {
            $table->id();
            $table->string('codigo')->unique();
            $table->foreignId('produto_id')->constrained('produtos')->onDelete('cascade');
            $table->decimal('quantidade_prevista', 10, 2);
            $table->decimal('quantidade_produzida', 10, 2)->default(0);
            $table->dateTime('inicio_previsto');
            $table->dateTime('fim_previsto');
            $table->dateTime('inicio_real')->nullable();
            $table->dateTime('fim_real')->nullable();
            $table->enum('status', ['aberta', 'em_producao', 'pausada', 'finalizada', 'cancelada'])->default('aberta');
            $table->enum('prioridade', ['baixa', 'media', 'alta', 'urgente'])->default('media');
            $table->string('sankhya_id')->nullable();
            $table->timestamps();
        });

        Schema::create('apontamentos', function (Blueprint $table) {
            $table->id();
            $table->foreignId('usuario_id')->constrained('usuarios')->onDelete('cascade');
            $table->foreignId('maquina_id')->constrained('maquinas')->onDelete('cascade');
            $table->foreignId('produto_id')->constrained('produtos')->onDelete('cascade');
            $table->foreignId('ordem_producao_id')->constrained('ordens_producao')->onDelete('cascade');
            $table->enum('tipo_apontamento', ['inicio', 'fim', 'producao', 'perda', 'parada']);
            $table->decimal('quantidade', 10, 2)->nullable();
            $table->string('unidade', 10)->nullable();
            $table->dateTime('inicio');
            $table->dateTime('fim')->nullable();
            $table->text('observacao')->nullable();
            $table->enum('status', ['pendente', 'em_andamento', 'registrado', 'finalizado', 'cancelado'])->default('pendente');
            $table->string('sankhya_id')->nullable();
            $table->boolean('sincronizado')->default(false);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('apontamentos');
        Schema::dropIfExists('ordens_producao');
        Schema::dropIfExists('produtos');
    }
};