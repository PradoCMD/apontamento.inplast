<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Maquina extends Model
{
    use HasFactory;

    protected $fillable = [
        'codigo',
        'nome',
        'tipo',
        'localizacao',
        'capacidade',
        'status',
        'sankhya_id',
    ];

    public function apontamentos()
    {
        return $this->hasMany(Apontamento::class);
    }
}