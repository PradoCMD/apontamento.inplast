<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Apontamento extends Model
{
    use HasFactory;

    protected $fillable = [
        'usuario_id',
        'maquina_id',
        'produto_id',
        'ordem_producao_id',
        'tipo_apontamento',
        'quantidade',
        'unidade',
        'inicio',
        'fim',
        'observacao',
        'status',
        'sankhya_id',
        'sincronizado',
    ];

    protected $casts = [
        'inicio' => 'datetime',
        'fim' => 'datetime',
        'quantidade' => 'decimal:2',
        'sincronizado' => 'boolean',
    ];

    public function usuario()
    {
        return $this->belongsTo(Usuario::class);
    }

    public function maquina()
    {
        return $this->belongsTo(Maquina::class);
    }

    public function produto()
    {
        return $this->belongsTo(Produto::class);
    }

    public function ordemProducao()
    {
        return $this->belongsTo(OrdemProducao::class);
    }
}