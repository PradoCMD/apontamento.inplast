import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../../lib/api";
import { toast } from "sonner";
import { ArrowLeft, Clock, FileText, Paperclip, Play, Pause, Square, CirclePlay, CircleAlert, Upload, File as FileIcon, CheckCircle2 } from "lucide-react";
import MotivosParadaModal from "../modais/MotivosParadaModal";
import ConfirmDialog from "../modais/ConfirmDialog";
import { format } from "date-fns";

const STATUS_MAP: Record<string, { class: string }> = {
  Criado: { class: "status-criado" },
  "Em andamento": { class: "status-andamento" },
  Finalizado: { class: "status-finalizado" },
  Parado: { class: "status-parado" },
};

interface Props {
  ordemId: number;
  onBack: () => void;
  onViewProdutos: (apontamentoId: number) => void;
}

export default function DetalheOP({ ordemId, onBack, onViewProdutos }: Props) {
  const qc = useQueryClient();
  const [tab, setTab] = useState<"execucao" | "apontamento" | "anexos">("execucao");
  const [showIniciar, setShowIniciar] = useState(false);
  const [showParar, setShowParar] = useState(false);
  const [showFinalizar, setShowFinalizar] = useState(false);
  const [finalizando, setFinalizando] = useState(false);

  const { data: ordem } = useQuery({ queryKey: ["ordem", ordemId], queryFn: () => api.getOrdem(ordemId) });
  const { data: execucoes = [] } = useQuery({ queryKey: ["execucoes", ordemId], queryFn: () => api.getExecucoes(ordemId) });
  const { data: apontamentos = [] } = useQuery({ queryKey: ["apontamentos", ordemId], queryFn: () => api.getApontamentos(ordemId) });
  const { data: anexos = [] } = useQuery({ queryKey: ["anexos", ordemId], queryFn: () => api.getAnexos(ordemId), enabled: tab === "anexos" });

  const refresh = () => { qc.invalidateQueries({ queryKey: ["ordem", ordemId] }); qc.invalidateQueries({ queryKey: ["execucoes", ordemId] }); qc.invalidateQueries({ queryKey: ["apontamentos", ordemId] }); };

  const iniciarMut = useMutation({
    mutationFn: () => api.iniciarAtividade(ordemId),
    onSuccess: (d) => { toast.success(d.message); refresh(); setShowIniciar(false); },
    onError: (e: any) => toast.error(e.message),
  });

  const pararMut = useMutation({
    mutationFn: (data: { motivoParadaId: number; observacao?: string }) => api.pararAtividade({ ordemId, ...data }),
    onSuccess: (d) => { toast.success(d.message); refresh(); setShowParar(false); },
    onError: (e: any) => toast.error(e.message),
  });

  const continuarMut = useMutation({
    mutationFn: () => api.continuarAtividade(ordemId),
    onSuccess: (d) => { toast.success(d.message); refresh(); },
    onError: (e: any) => toast.error(e.message),
  });

  const finalizarMut = useMutation({
    mutationFn: () => api.finalizarAtividade(ordemId),
    onSuccess: (d) => { setFinalizando(false); toast.success(d.message); refresh(); setShowFinalizar(false); },
    onError: (e: any) => { setFinalizando(false); toast.error(e.message); },
  });

  const criarApontMut = useMutation({
    mutationFn: () => api.criarApontamento(ordemId),
    onSuccess: (d) => { toast.success(d.message); qc.invalidateQueries({ queryKey: ["apontamentos", ordemId] }); },
    onError: (e: any) => toast.error(e.message),
  });

  const uploadMut = useMutation({
    mutationFn: (file: File) => api.uploadAnexo(ordemId, file),
    onSuccess: () => { toast.success("Arquivo enviado!"); qc.invalidateQueries({ queryKey: ["anexos", ordemId] }); },
    onError: () => toast.error("Erro no upload"),
  });

  if (!ordem) return <div className="flex items-center justify-center min-h-dvh"><div className="w-8 h-8 border-3 border-accent border-t-transparent rounded-full animate-spin" /></div>;

  const st = STATUS_MAP[ordem.status] || STATUS_MAP.Criado;
  const isActive = ordem.status === "Em andamento";
  const isPaused = ordem.status === "Parado";
  const isFinished = ordem.status === "Finalizado";

  const tabs = [
    { key: "execucao" as const, label: "Execução", icon: Clock },
    { key: "apontamento" as const, label: "Apontamento", icon: FileText },
    { key: "anexos" as const, label: "Anexos", icon: Paperclip },
  ];

  return (
    <div className="min-h-dvh flex flex-col">
      {/* Header */}
      <header className="bg-primary sticky top-0 z-30 shadow-lg">
        <div className="flex items-center px-4 h-14">
          <button onClick={onBack} className="p-2 -ml-2 text-white/70 hover:text-white transition-colors cursor-pointer" aria-label="Voltar">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-white font-semibold text-base ml-2 flex-1">Nro OP: {ordem.nroOp}</h1>
        </div>

        {/* Tabs */}
        <div className="flex border-t border-white/10">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`flex-1 flex flex-col items-center gap-1 py-2.5 text-xs font-medium transition-all cursor-pointer ${
                tab === t.key ? "text-white border-b-2 border-accent" : "text-white/50 hover:text-white/80"
              }`}
            >
              <t.icon className="w-4.5 h-4.5" />
              {t.label}
            </button>
          ))}
        </div>
      </header>

      {/* OP Info */}
      <div className="px-4 py-3 bg-surface-elevated border-b border-border">
        <h2 className="text-accent font-bold text-sm mb-1">{ordem.atividade || "APONTAMENTO"}</h2>
        <p className="text-text-secondary text-xs mb-1">
          <span className="text-text-muted">Produto: </span>{ordem.produto}
        </p>
        <div className="flex items-center gap-3 text-xs text-text-secondary">
          <span><span className="text-text-muted">Nro. Lote: </span>{ordem.lote}</span>
          <span><span className="text-text-muted">Qtd: </span>{Number(ordem.qtdProduzir).toLocaleString("pt-BR")}</span>
        </div>
        <div className="mt-1.5">
          <span className={`status-badge ${st.class}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${st.class === "status-criado" ? "bg-status-criado" : st.class === "status-andamento" ? "bg-status-andamento" : st.class === "status-finalizado" ? "bg-status-finalizado" : "bg-status-parado"}`} />
            {ordem.status}
          </span>
        </div>
      </div>

      {/* Tab Content */}
      <div className="flex-1 px-4 py-4">

        {/* === EXECUÇÃO TAB === */}
        {tab === "execucao" && (
          <div className="space-y-4 animate-fade-in">
            {/* Action Buttons */}
            {!isFinished && (
              <div className="flex gap-3">
                {ordem.status === "Criado" && (
                  <button onClick={() => setShowIniciar(true)} className="flex-1 h-16 bg-surface-card border border-border rounded-xl flex flex-col items-center justify-center gap-1 hover:border-accent/50 active:scale-[0.97] transition-all cursor-pointer">
                    <Play className="w-6 h-6 text-accent" />
                    <span className="text-xs text-text-secondary">Iniciar Atividade</span>
                  </button>
                )}
                {isActive && (
                  <>
                    <button onClick={() => setShowParar(true)} className="flex-1 h-16 bg-surface-card border border-border rounded-xl flex flex-col items-center justify-center gap-1 hover:border-warning/50 active:scale-[0.97] transition-all cursor-pointer">
                      <Pause className="w-6 h-6 text-warning" />
                      <span className="text-xs text-text-secondary">Parar Atividade</span>
                    </button>
                    <button onClick={() => setShowFinalizar(true)} className="flex-1 h-16 bg-surface-card border border-border rounded-xl flex flex-col items-center justify-center gap-1 hover:border-danger/50 active:scale-[0.97] transition-all cursor-pointer">
                      <Square className="w-6 h-6 text-danger" />
                      <span className="text-xs text-text-secondary">Finalizar atividade</span>
                    </button>
                  </>
                )}
                {isPaused && (
                  <>
                    <button onClick={() => continuarMut.mutate()} className="flex-1 h-16 bg-surface-card border border-border rounded-xl flex flex-col items-center justify-center gap-1 hover:border-accent/50 active:scale-[0.97] transition-all cursor-pointer">
                      <CirclePlay className="w-6 h-6 text-accent" />
                      <span className="text-xs text-text-secondary">Continuar</span>
                    </button>
                    <button onClick={() => setShowFinalizar(true)} className="flex-1 h-16 bg-surface-card border border-border rounded-xl flex flex-col items-center justify-center gap-1 hover:border-danger/50 active:scale-[0.97] transition-all cursor-pointer">
                      <Square className="w-6 h-6 text-danger" />
                      <span className="text-xs text-text-secondary">Finalizar atividade</span>
                    </button>
                  </>
                )}
              </div>
            )}

            {/* Execuções Log */}
            <div>
              <h3 className="text-accent font-semibold text-sm mb-3 border-b border-border pb-2">Execuções</h3>
              {execucoes.length === 0 ? (
                <p className="text-text-muted text-sm text-center py-6">Nenhuma execução registrada</p>
              ) : (
                <div className="space-y-3">
                  {execucoes.map((e: any) => (
                    <div key={e.id} className="bg-surface-card rounded-lg p-3 border border-border animate-fade-in">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-semibold">Tipo: {e.tipo}</span>
                        <span className={`w-2 h-2 rounded-full ${e.tipo === "Normal" ? "bg-accent" : "bg-danger"}`} />
                      </div>
                      {e.motivoParadaDescricao && (
                        <p className="text-xs text-warning mb-1">
                          <CircleAlert className="w-3 h-3 inline-block mr-1" />
                          {e.motivoParadaDescricao}
                        </p>
                      )}
                      <p className="text-xs text-text-muted">
                        <span className="text-text-secondary">Dh. Início:</span> {e.dhInicio ? format(new Date(e.dhInicio), "dd/MM HH:mm:ss") : "-"}
                      </p>
                      <p className="text-xs text-text-muted">
                        <span className="text-text-secondary">Dh. Final:</span> {e.dhFinal ? format(new Date(e.dhFinal), "dd/MM HH:mm:ss") : "-"}
                      </p>
                      {e.observacao && <p className="text-xs text-text-muted mt-1"><span className="text-text-secondary">Observação:</span> {e.observacao}</p>}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* === APONTAMENTO TAB === */}
        {tab === "apontamento" && (
          <div className="space-y-4 animate-fade-in">
            <button
              onClick={() => criarApontMut.mutate()}
              disabled={criarApontMut.isPending}
              className="w-full h-12 bg-surface-card border border-dashed border-accent/40 rounded-xl flex items-center justify-center gap-2 text-accent text-sm font-medium hover:bg-accent/10 active:scale-[0.98] transition-all cursor-pointer"
            >
              <FileText className="w-4 h-4" />
              Inserir Novo Apontamento
            </button>

            {apontamentos.length === 0 ? (
              <p className="text-text-muted text-sm text-center py-6">Nenhum apontamento</p>
            ) : (
              apontamentos.map((ap: any) => (
                <div key={ap.id} className="bg-surface-card rounded-lg p-3 border border-border">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-text">Nro. Apontamento: {ap.nroApontamento}</span>
                    <span className={`status-badge ${ap.situacao === "Confirmado" ? "status-finalizado" : "status-criado"}`}>
                      {ap.situacao}
                    </span>
                  </div>
                  <p className="text-xs text-text-muted mb-2">Data/Hora: {format(new Date(ap.dataHora), "dd/MM/yyyy HH:mm:ss")}</p>
                  <button
                    onClick={() => onViewProdutos(ap.id)}
                    className="w-full h-9 bg-accent/10 border border-accent/20 rounded-lg text-accent text-xs font-medium hover:bg-accent/20 active:scale-[0.98] transition-all cursor-pointer flex items-center justify-center gap-1"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    Visualizar produtos
                  </button>
                </div>
              ))
            )}
          </div>
        )}

        {/* === ANEXOS TAB === */}
        {tab === "anexos" && (
          <div className="space-y-4 animate-fade-in">
            <label className="w-full h-12 bg-surface-card border border-dashed border-accent/40 rounded-xl flex items-center justify-center gap-2 text-accent text-sm font-medium hover:bg-accent/10 transition-all cursor-pointer">
              <Upload className="w-4 h-4" />
              Upload de Arquivo
              <input type="file" className="hidden" onChange={(e) => { if (e.target.files?.[0]) uploadMut.mutate(e.target.files[0]); }} />
            </label>

            {anexos.length === 0 ? (
              <p className="text-text-muted text-sm text-center py-6">Nenhum anexo</p>
            ) : (
              anexos.map((a: any) => (
                <div key={a.id} className="bg-surface-card rounded-lg p-3 border border-border flex items-center gap-3">
                  <FileIcon className="w-8 h-8 text-accent flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-text truncate">{a.filename}</p>
                    <p className="text-xs text-text-muted">{format(new Date(a.createdAt), "dd/MM/yyyy HH:mm")}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Modals */}
      <ConfirmDialog
        open={showIniciar}
        title="Realizar a Inicialização da OP?"
        onCancel={() => setShowIniciar(false)}
        onConfirm={() => iniciarMut.mutate()}
        loading={iniciarMut.isPending}
      />

      <MotivosParadaModal
        open={showParar}
        onClose={() => setShowParar(false)}
        onConfirm={(motivoParadaId, observacao) => pararMut.mutate({ motivoParadaId, observacao })}
        loading={pararMut.isPending}
      />

      <ConfirmDialog
        open={showFinalizar}
        title="Finalizar a Atividade?"
        message="Esta ação não pode ser desfeita."
        onCancel={() => setShowFinalizar(false)}
        onConfirm={() => { setFinalizando(true); finalizarMut.mutate(); }}
        loading={finalizando}
        variant="danger"
      />
    </div>
  );
}
