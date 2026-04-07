import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../../lib/api";
import { toast } from "sonner";
import { ArrowLeft, BarChart3, Plus, CheckCircle2, Search } from "lucide-react";

interface Props {
  apontamentoId: number;
  ordemId: number;
  onBack: () => void;
}

export default function ProdutosView({ apontamentoId, ordemId, onBack }: Props) {
  const qc = useQueryClient();
  const [showQtdModal, setShowQtdModal] = useState<{ paId: number; produto: string } | null>(null);
  const [showPerdaModal, setShowPerdaModal] = useState(false);
  const [qtdProduzida, setQtdProduzida] = useState("");
  const [qtdPerda, setQtdPerda] = useState("");
  const [motivoPerdaId, setMotivoPerdaId] = useState<number | null>(null);
  const [showMotivosPerda, setShowMotivosPerda] = useState(false);
  const [searchPerda, setSearchPerda] = useState("");

  const { data: apontamento } = useQuery({ queryKey: ["apontamento", apontamentoId], queryFn: () => api.getApontamento(apontamentoId) });
  const { data: paList = [] } = useQuery({ queryKey: ["pa", apontamentoId], queryFn: () => api.getPA(apontamentoId) });
  const { data: mpList = [] } = useQuery({ queryKey: ["mp", apontamentoId], queryFn: () => api.getMP(apontamentoId) });
  const { data: motivosPerda = [] } = useQuery({ queryKey: ["motivos-perda"], queryFn: api.getMotivosPerda, enabled: showMotivosPerda });

  const updatePAMut = useMutation({
    mutationFn: ({ paId, data }: { paId: number; data: any }) => api.updatePA(paId, data),
    onSuccess: () => { toast.success("Quantidades atualizadas!"); qc.invalidateQueries({ queryKey: ["pa", apontamentoId] }); setShowQtdModal(null); },
    onError: (e: any) => toast.error(e.message),
  });

  const confirmarMut = useMutation({
    mutationFn: () => api.confirmarApontamento(apontamentoId),
    onSuccess: (d) => { toast.success(d.message); qc.invalidateQueries({ queryKey: ["apontamento", apontamentoId] }); qc.invalidateQueries({ queryKey: ["apontamentos", ordemId] }); },
    onError: (e: any) => toast.error(e.message),
  });

  const isConfirmado = apontamento?.situacao === "Confirmado";

  const handleSaveQtd = () => {
    if (!showQtdModal) return;
    const data: any = { qtdProduzida: qtdProduzida || "0", qtdPerda: qtdPerda || "0" };
    if (motivoPerdaId && Number(qtdPerda) > 0) data.motivoPerdaId = motivoPerdaId;
    updatePAMut.mutate({ paId: showQtdModal.paId, data });
  };

  const openQtdModal = (pa: any) => {
    setQtdProduzida(pa.qtdProduzida || "0");
    setQtdPerda(pa.qtdPerda || "0");
    setMotivoPerdaId(pa.motivoPerdaId || null);
    setShowQtdModal({ paId: pa.id, produto: pa.produto });
  };

  // Motivos de Perda selection
  if (showMotivosPerda) {
    const filtered = motivosPerda.filter((m: any) =>
      m.descricao.toLowerCase().includes(searchPerda.toLowerCase()) || String(m.codigo).includes(searchPerda)
    );
    return (
      <div className="fixed inset-0 z-50 bg-surface flex flex-col animate-slide-up">
        <header className="bg-danger flex items-center px-4 h-14">
          <button onClick={() => setShowMotivosPerda(false)} className="p-2 -ml-2 text-white/70 hover:text-white cursor-pointer" aria-label="Voltar">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-white font-semibold text-base ml-2 flex-1">Motivos de Perdas</h1>
        </header>
        <div className="px-4 py-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
            <input type="search" placeholder="Buscar motivo..." value={searchPerda} onChange={(e) => setSearchPerda(e.target.value)}
              className="w-full h-10 pl-10 pr-4 bg-surface-card border border-border rounded-lg text-text text-sm placeholder:text-text-muted focus:outline-none focus:border-danger transition-all" />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto px-4 pb-6">
          {filtered.map((m: any) => (
            <button key={m.id} onClick={() => { setMotivoPerdaId(m.id); setShowMotivosPerda(false); }}
              className={`w-full flex items-center gap-4 py-3.5 border-b border-border/50 hover:bg-surface-card active:bg-surface-elevated transition-all cursor-pointer text-left ${motivoPerdaId === m.id ? "bg-danger/10" : ""}`}>
              <span className="w-10 h-10 bg-surface-card rounded-lg flex items-center justify-center text-sm font-bold text-danger border border-border flex-shrink-0">{m.codigo}</span>
              <span className="text-sm text-text">{m.descricao}</span>
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-dvh flex flex-col">
      {/* Header */}
      <header className="bg-primary sticky top-0 z-30 shadow-lg">
        <div className="flex items-center px-4 h-14">
          <button onClick={onBack} className="p-2 -ml-2 text-white/70 hover:text-white cursor-pointer" aria-label="Voltar">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-white font-semibold text-base ml-2">Nro OP: {apontamento?.nroOp || ""}</h1>
        </div>
      </header>

      <div className="flex-1 px-4 py-4 space-y-5">
        {/* Produtos Acabados */}
        <section>
          <h3 className="text-accent font-bold text-sm mb-3 border-b border-accent/30 pb-2">Produtos Acabados</h3>
          {paList.length === 0 ? (
            <p className="text-text-muted text-sm text-center py-4">Nenhum PA registrado</p>
          ) : (
            paList.map((pa: any) => (
              <button key={pa.id} onClick={() => !isConfirmado && openQtdModal(pa)}
                className="w-full bg-surface-card rounded-xl p-4 border border-border mb-3 text-left cursor-pointer hover:border-accent/30 active:scale-[0.98] transition-all">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-text mb-1">Produto: {pa.produto}</p>
                    <p className="text-xs text-text-muted">Un. Medida: {pa.unMedida}</p>
                    <p className="text-xs text-text-muted">Controle: {pa.controle || "-"}</p>
                    <p className="text-xs text-text-muted">Quantidade: {Number(pa.quantidade).toLocaleString("pt-BR")}</p>
                    {Number(pa.qtdProduzida) > 0 && (
                      <p className="text-xs text-accent mt-1">Produzida: {Number(pa.qtdProduzida).toLocaleString("pt-BR")}</p>
                    )}
                    {Number(pa.qtdPerda) > 0 && (
                      <p className="text-xs text-danger mt-0.5">Perda: {Number(pa.qtdPerda).toLocaleString("pt-BR")}</p>
                    )}
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <BarChart3 className="w-5 h-5 text-accent" />
                    <span className="text-sm font-bold text-accent">{Number(pa.quantidade).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</span>
                  </div>
                </div>
              </button>
            ))
          )}
        </section>

        {/* Matérias Primas */}
        <section>
          <h3 className="text-warning font-bold text-sm mb-3 border-b border-warning/30 pb-2">Matérias Primas</h3>
          {mpList.length === 0 ? (
            <p className="text-text-muted text-sm text-center py-4">Nenhuma MP registrada</p>
          ) : (
            mpList.map((mp: any) => (
              <div key={mp.id} className="bg-surface-card rounded-xl p-4 border border-border mb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-text mb-1">Produto: {mp.produto}</p>
                    <p className="text-xs text-text-muted">Un. Medida: {mp.unMedida}</p>
                    <p className="text-xs text-text-muted">Controle: {mp.controle || "-"}</p>
                    <p className="text-xs text-text-muted">Quantidade: {Number(mp.quantidade).toLocaleString("pt-BR")}</p>
                  </div>
                  <div className="flex flex-col items-end">
                    <BarChart3 className="w-5 h-5 text-warning" />
                    <span className="text-sm font-bold text-warning">{Number(mp.quantidade).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </section>

        {/* Confirmar */}
        {!isConfirmado && (paList.length > 0 || mpList.length > 0) && (
          <button
            onClick={() => confirmarMut.mutate()}
            disabled={confirmarMut.isPending}
            className="w-full h-14 bg-gradient-to-r from-accent to-primary-light rounded-xl text-white font-semibold flex items-center justify-center gap-2 shadow-lg shadow-accent/20 active:scale-[0.97] transition-all cursor-pointer disabled:opacity-50"
          >
            {confirmarMut.isPending ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <CheckCircle2 className="w-5 h-5" />
                Confirmar Apontamento
              </>
            )}
          </button>
        )}
        {isConfirmado && (
          <div className="bg-accent/10 border border-accent/30 rounded-xl p-4 text-center">
            <CheckCircle2 className="w-8 h-8 text-accent mx-auto mb-2" />
            <p className="text-accent font-semibold">Apontamento Confirmado</p>
          </div>
        )}
      </div>

      {/* Qtd Modal */}
      {showQtdModal && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm animate-fade-in" onClick={() => setShowQtdModal(null)}>
          <div className="bg-surface-dialog rounded-t-2xl p-6 w-full max-w-lg shadow-2xl border-t border-border animate-slide-up" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-text font-semibold text-base text-center mb-4">Informe as quantidades</h3>
            <p className="text-xs text-text-muted text-center mb-4">{showQtdModal.produto}</p>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <label htmlFor="qtd-produzida" className="text-xs font-medium text-text-secondary">Qtd. Produzida</label>
                <input id="qtd-produzida" type="number" inputMode="decimal" value={qtdProduzida} onChange={(e) => setQtdProduzida(e.target.value)}
                  className="w-full h-12 px-4 bg-surface-card border border-border rounded-xl text-text text-lg font-medium focus:outline-none focus:border-accent transition-all" />
              </div>

              <div className="space-y-1.5">
                <label htmlFor="qtd-perda" className="text-xs font-medium text-text-secondary">Qtd. Perda</label>
                <input id="qtd-perda" type="number" inputMode="decimal" value={qtdPerda} onChange={(e) => setQtdPerda(e.target.value)}
                  className="w-full h-12 px-4 bg-surface-card border border-border rounded-xl text-text text-lg font-medium focus:outline-none focus:border-danger transition-all" />
              </div>

              {Number(qtdPerda) > 0 && (
                <button onClick={() => setShowMotivosPerda(true)}
                  className="w-full h-10 bg-danger/10 border border-danger/20 rounded-lg text-danger text-xs font-medium cursor-pointer hover:bg-danger/20 transition-all flex items-center justify-center gap-1">
                  {motivoPerdaId ? `Motivo selecionado (${motivoPerdaId})` : "Selecionar motivo de perda →"}
                </button>
              )}
            </div>

            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowQtdModal(null)} className="flex-1 h-11 bg-surface-card border border-border rounded-xl text-text-secondary text-sm font-medium cursor-pointer hover:bg-surface-elevated transition-all">Cancelar</button>
              <button onClick={handleSaveQtd} disabled={updatePAMut.isPending}
                className="flex-1 h-11 bg-accent hover:bg-accent-hover rounded-xl text-white text-sm font-semibold cursor-pointer active:scale-[0.97] transition-all disabled:opacity-50">
                {updatePAMut.isPending ? "Salvando..." : "Salvar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
