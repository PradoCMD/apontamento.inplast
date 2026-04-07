import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "../../lib/api";
import { useAuth } from "../../hooks/useAuth";
import { Search, RefreshCw, Filter, LogOut, ChevronRight } from "lucide-react";
import { toast } from "sonner";

const STATUS_MAP: Record<string, { class: string; dot: string }> = {
  Criado: { class: "status-criado", dot: "bg-status-criado" },
  "Em andamento": { class: "status-andamento", dot: "bg-status-andamento" },
  Finalizado: { class: "status-finalizado", dot: "bg-status-finalizado" },
  Parado: { class: "status-parado", dot: "bg-status-parado" },
};

interface Props {
  onSelectOrdem: (id: number) => void;
}

export default function OrdensPage({ onSelectOrdem }: Props) {
  const { logout, user } = useAuth();
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("");
  const [showFilter, setShowFilter] = useState(false);

  const { data: ordens = [], isLoading, refetch, isFetching } = useQuery({
    queryKey: ["ordens", search, filterStatus],
    queryFn: () => api.getOrdens(search, filterStatus),
  });

  return (
    <div className="min-h-dvh flex flex-col">
      {/* Header */}
      <header className="bg-primary sticky top-0 z-30 shadow-lg shadow-primary-dark/30">
        <div className="flex items-center justify-between px-4 h-14">
          <button onClick={logout} className="p-2 text-white/70 hover:text-white transition-colors cursor-pointer" aria-label="Sair">
            <LogOut className="w-5 h-5" />
          </button>
          <h1 className="text-white font-semibold text-base tracking-wide">Ordens de Prod.</h1>
          <div className="flex items-center gap-1">
            <button
              onClick={() => { refetch(); toast.info("Atualizando..."); }}
              className="p-2 text-white/70 hover:text-white transition-colors cursor-pointer"
              aria-label="Atualizar"
            >
              <RefreshCw className={`w-5 h-5 ${isFetching ? "animate-spin" : ""}`} />
            </button>
            <button
              onClick={() => setShowFilter(!showFilter)}
              className={`p-2 transition-colors cursor-pointer ${showFilter ? "text-accent" : "text-white/70 hover:text-white"}`}
              aria-label="Filtrar"
            >
              <Filter className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="px-4 pb-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
            <input
              type="search"
              placeholder="Pesquisar..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full h-10 pl-10 pr-4 bg-primary-dark/50 border border-white/10 rounded-lg text-white text-sm placeholder:text-white/40 focus:outline-none focus:border-accent/50 transition-all"
            />
          </div>
        </div>

        {/* Filter bar */}
        {showFilter && (
          <div className="px-4 pb-3 flex gap-2 overflow-x-auto animate-fade-in">
            {["", "Criado", "Em andamento", "Finalizado", "Parado"].map((s) => (
              <button
                key={s}
                onClick={() => setFilterStatus(s)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all cursor-pointer ${
                  filterStatus === s ? "bg-accent text-white" : "bg-white/10 text-white/60 hover:bg-white/20"
                }`}
              >
                {s || "Todos"}
              </button>
            ))}
          </div>
        )}
      </header>

      {/* User info */}
      <div className="px-4 py-2 flex items-center justify-between text-xs text-text-muted">
        <span>Olá, <span className="text-text-secondary font-medium">{user?.nome}</span></span>
        <span>{ordens.length} ordens</span>
      </div>

      {/* List */}
      <div className="flex-1 px-4 pb-6 space-y-3">
        {isLoading ? (
          <div className="flex justify-center pt-20">
            <div className="w-8 h-8 border-3 border-accent border-t-transparent rounded-full animate-spin" />
          </div>
        ) : ordens.length === 0 ? (
          <div className="text-center pt-20 text-text-muted">Nenhuma ordem encontrada</div>
        ) : (
          ordens.map((op: any, i: number) => {
            const st = STATUS_MAP[op.status] || STATUS_MAP.Criado;
            return (
              <button
                key={op.id}
                onClick={() => onSelectOrdem(op.id)}
                className="card-op w-full text-left cursor-pointer animate-fade-in"
                style={{ animationDelay: `${i * 40}ms` }}
              >
                <div className="flex items-start justify-between mb-2">
                  <h3 className="text-accent font-bold text-base">Nro. OP: {op.nroOp}</h3>
                  <ChevronRight className="w-5 h-5 text-text-muted flex-shrink-0 mt-0.5" />
                </div>
                <div className="space-y-1 text-sm">
                  <div className="flex items-center gap-2">
                    <span className="text-text-secondary">Status:</span>
                    <span className={`status-badge ${st.class}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${st.dot}`} />
                      {op.status}
                    </span>
                  </div>
                  <p className="text-text-secondary">
                    <span className="text-text-muted">Produto: </span>{op.produto}
                  </p>
                  <p className="text-text-secondary">
                    <span className="text-text-muted">Qtd. a Produzir: </span>
                    <span className="text-text font-medium">{Number(op.qtdProduzir).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</span>
                    {op.lote && <span className="text-text-muted ml-2">Lote: {op.lote}</span>}
                  </p>
                  {op.atividade && (
                    <p className="text-text-secondary">
                      <span className="text-text-muted">Atividade: </span>{op.atividade}
                    </p>
                  )}
                </div>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}
