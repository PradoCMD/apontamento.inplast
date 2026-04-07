<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Laravel\Sanctum\HasApiTokens;
use Illuminate\Foundation\Auth\User as Authenticatable;

class Usuario extends Authenticatable
{
    use HasFactory, HasApiTokens;

    protected $fillable = [
        'codigo',
        'nome',
        'email',
        'cpf',
        'tipo',
        'ativo',
        'sankhya_id',
    ];

    protected $casts = [
        'ativo' => 'boolean',
    ];

    public function apontamentos()
    {
        return $this->hasMany(Apontamento::class);
    }

    public function isOperador()
    {
        return $this->tipo === 'operador';
    }

    public function isSupervisor()
    {
        return $this->tipo === 'supervisor';
    }
}