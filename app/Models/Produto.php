<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Produto extends Model
{
    use HasFactory;

    protected $fillable = [
        'codigo',
        'nome',
        'descricao',
        'unidade',
        'familia',
        'ativo',
        'sankhya_id',
    ];

    protected $casts = [
        'ativo' => 'boolean',
    ];

    public function ordensProducao()
    {
        return $this->hasMany(OrdemProducao::class);
    }
}