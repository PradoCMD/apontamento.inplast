<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class OrdemProducao extends Model
{
    use HasFactory;

    protected $fillable = [
        'codigo',
        'produto_id',
        'quantidade_prevista',
        'quantidade_produzida',
        'inicio_previsto',
        'fim_previsto',
        'inicio_real',
        'fim_real',
        'status',
        'prioridade',
        'sankhya_id',
    ];

    protected $casts = [
        'inicio_previsto' => 'datetime',
        'fim_previsto' => 'datetime',
        'inicio_real' => 'datetime',
        'fim_real' => 'datetime',
        'quantidade_prevista' => 'decimal:2',
        'quantidade_produzida' => 'decimal:2',
    ];

    public function produto()
    {
        return $this->belongsTo(Produto::class);
    }

    public function apontamentos()
    {
        return $this->hasMany(Apontamento::class);
    }

    public function isAberta()
    {
        return $this->status === 'aberta';
    }

    public function isFinalizada()
    {
        return $this->status === 'finalizada';
    }
}