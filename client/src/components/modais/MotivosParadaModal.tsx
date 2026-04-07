import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "../../lib/api";
import { ArrowLeft, Search } from "lucide-react";

interface Props {
  open: boolean;
  onClose: () => void;
  onConfirm: (motivoId: number, observacao?: string) => void;
  loading?: boolean;
}

export default function MotivosParadaModal({ open, onClose, onConfirm, loading }: Props) {
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [observacao, setObservacao] = useState("");
  const [search, setSearch] = useState("");

  const { data: motivos = [] } = useQuery({
    queryKey: ["motivos-parada"],
    queryFn: api.getMotivosParada,
    enabled: open,
  });

  if (!open) return null;

  const filtered = motivos.filter((m: any) =>
    m.descricao.toLowerCase().includes(search.toLowerCase()) || String(m.codigo).includes(search)
  );

  if (selectedId !== null) {
    const motivo = motivos.find((m: any) => m.id === selectedId);
    return (
      <div className="fixed inset-0 z-50 bg-surface flex flex-col animate-slide-up">
        <header className="bg-primary flex items-center px-4 h-14">
          <button onClick={() => setSelectedId(null)} className="p-2 -ml-2 text-white/70 hover:text-white cursor-pointer" aria-label="Voltar">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-white font-semibold text-base ml-2">Parar Atividade</h1>
        </header>
        <div className="flex-1 px-4 py-6 space-y-4">
          <div className="bg-surface-card rounded-xl p-4 border border-border">
            <p className="text-xs text-text-muted mb-1">Motivo selecionado:</p>
            <p className="text-accent font-medium">{motivo?.codigo} — {motivo?.descricao}</p>
          </div>
          <div className="space-y-1.5">
            <label htmlFor="parada-obs" className="text-xs font-medium text-text-secondary">Observação</label>
            <textarea
              id="parada-obs"
              value={observacao}
              onChange={(e) => setObservacao(e.target.value)}
              placeholder="Descreva a observação da parada..."
              rows={4}
              className="w-full px-4 py-3 bg-surface-card border border-border rounded-xl text-text placeholder:text-text-muted text-sm focus:outline-none focus:border-accent transition-all resize-none"
            />
          </div>
          <div className="flex gap-3">
            <button onClick={onClose} className="flex-1 h-11 bg-surface-card border border-border rounded-xl text-text-secondary text-sm font-medium cursor-pointer hover:bg-surface-elevated transition-all">Cancelar</button>
            <button
              onClick={() => onConfirm(selectedId, observacao)}
              disabled={loading}
              className="flex-1 h-11 bg-warning hover:bg-warning-hover rounded-xl text-white text-sm font-semibold cursor-pointer active:scale-[0.97] transition-all disabled:opacity-50"
            >
              {loading ? "Salvando..." : "Confirmar Parada"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-surface flex flex-col animate-slide-up">
      <header className="bg-primary flex items-center px-4 h-14">
        <button onClick={onClose} className="p-2 -ml-2 text-white/70 hover:text-white cursor-pointer" aria-label="Voltar">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-white font-semibold text-base ml-2 flex-1">Motivos de Paradas</h1>
      </header>
      <div className="px-4 py-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
          <input
            type="search"
            placeholder="Buscar motivo..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-10 pl-10 pr-4 bg-surface-card border border-border rounded-lg text-text text-sm placeholder:text-text-muted focus:outline-none focus:border-accent transition-all"
          />
        </div>
      </div>
      <div className="flex-1 overflow-y-auto px-4 pb-6">
        {filtered.map((m: any) => (
          <button
            key={m.id}
            onClick={() => setSelectedId(m.id)}
            className="w-full flex items-center gap-4 py-3.5 border-b border-border/50 hover:bg-surface-card active:bg-surface-elevated transition-all cursor-pointer text-left"
          >
            <span className="w-10 h-10 bg-surface-card rounded-lg flex items-center justify-center text-sm font-bold text-accent border border-border flex-shrink-0">
              {m.codigo}
            </span>
            <span className="text-sm text-text">{m.descricao}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
