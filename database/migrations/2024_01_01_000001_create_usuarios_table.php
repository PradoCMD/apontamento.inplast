<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('usuarios', function (Blueprint $table) {
            $table->id();
            $table->string('codigo')->unique();
            $table->string('nome');
            $table->string('email')->nullable();
            $table->string('cpf')->nullable();
            $table->string('password');
            $table->enum('tipo', ['operador', 'supervisor', 'admin'])->default('operador');
            $table->boolean('ativo')->default(true);
            $table->string('sankhya_id')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('usuarios');
    }
};