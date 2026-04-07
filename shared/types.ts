// ===== Shared Types - Inplast Aponta =====

export type StatusOP = "Criado" | "Em andamento" | "Finalizado" | "Parado";
export type TipoExecucao = "Normal" | "Parada";
export type SituacaoApontamento = "Pendente" | "Confirmado";

export interface OrdemProducao {
  id: number;
  nroOp: string;
  status: StatusOP;
  produto: string;
  qtdProduzir: number;
  lote: string;
  atividade: string;
  sankhyaId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Execucao {
  id: number;
  ordemId: number;
  tipo: TipoExecucao;
  motivoParadaId?: number | null;
  motivoParadaDescricao?: string;
  dhInicio: string;
  dhFinal?: string | null;
  observacao?: string;
}

export interface Apontamento {
  id: number;
  ordemId: number;
  nroApontamento: string;
  dataHora: string;
  situacao: SituacaoApontamento;
  syncedSankhya: boolean;
}

export interface ProdutoAcabado {
  id: number;
  apontamentoId: number;
  produto: string;
  unMedida: string;
  controle: string;
  quantidade: number;
  qtdProduzida: number;
  qtdPerda: number;
  motivoPerdaId?: number | null;
}

export interface MateriaPrima {
  id: number;
  apontamentoId: number;
  produto: string;
  unMedida: string;
  controle: string;
  quantidade: number;
}

export interface MotivoParada {
  id: number;
  codigo: number;
  descricao: string;
}

export interface MotivoPerda {
  id: number;
  codigo: number;
  descricao: string;
}

export interface Anexo {
  id: number;
  ordemId: number;
  filename: string;
  path: string;
  mimeType: string;
  createdAt: string;
}

export interface User {
  id: number;
  username: string;
  nome: string;
  role: string;
  ativo: boolean;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: User;
}
