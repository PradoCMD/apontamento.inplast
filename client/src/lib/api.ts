const BASE = "/api";

async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const token = localStorage.getItem("aponta_token");
  const headers: Record<string, string> = { "Content-Type": "application/json", ...(options?.headers as Record<string, string> || {}) };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${BASE}${url}`, { ...options, headers });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: "Erro desconhecido" }));
    throw new Error(err.error || `HTTP ${res.status}`);
  }
  return res.json();
}

export const api = {
  // Auth
  login: (data: { username: string; password: string }) => request<any>("/auth/login", { method: "POST", body: JSON.stringify(data) }),
  me: () => request<any>("/auth/me"),

  // Ordens
  getOrdens: (search?: string, status?: string) => {
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (status) params.set("status", status);
    return request<any[]>(`/ordens?${params}`);
  },
  getOrdem: (id: number) => request<any>(`/ordens/${id}`),
  updateStatus: (id: number, status: string) => request<any>(`/ordens/${id}/status`, { method: "PATCH", body: JSON.stringify({ status }) }),

  // Execuções
  getExecucoes: (ordemId: number) => request<any[]>(`/execucoes/ordem/${ordemId}`),
  iniciarAtividade: (ordemId: number) => request<any>("/execucoes/iniciar", { method: "POST", body: JSON.stringify({ ordemId }) }),
  pararAtividade: (data: { ordemId: number; motivoParadaId: number; observacao?: string }) => request<any>("/execucoes/parar", { method: "POST", body: JSON.stringify(data) }),
  continuarAtividade: (ordemId: number) => request<any>("/execucoes/continuar", { method: "POST", body: JSON.stringify({ ordemId }) }),
  finalizarAtividade: (ordemId: number) => request<any>("/execucoes/finalizar", { method: "POST", body: JSON.stringify({ ordemId }) }),

  // Apontamentos
  getApontamentos: (ordemId: number) => request<any[]>(`/apontamentos/ordem/${ordemId}`),
  getApontamento: (id: number) => request<any>(`/apontamentos/${id}`),
  criarApontamento: (ordemId: number) => request<any>("/apontamentos", { method: "POST", body: JSON.stringify({ ordemId }) }),
  confirmarApontamento: (id: number) => request<any>(`/apontamentos/${id}/confirmar`, { method: "POST" }),

  // PA
  getPA: (apontamentoId: number) => request<any[]>(`/apontamentos/${apontamentoId}/pa`),
  addPA: (apontamentoId: number, data: any) => request<any>(`/apontamentos/${apontamentoId}/pa`, { method: "POST", body: JSON.stringify(data) }),
  updatePA: (paId: number, data: any) => request<any>(`/apontamentos/pa/${paId}`, { method: "PATCH", body: JSON.stringify(data) }),

  // MP
  getMP: (apontamentoId: number) => request<any[]>(`/apontamentos/${apontamentoId}/mp`),
  addMP: (apontamentoId: number, data: any) => request<any>(`/apontamentos/${apontamentoId}/mp`, { method: "POST", body: JSON.stringify(data) }),

  // Motivos
  getMotivosParada: () => request<any[]>("/motivos/parada"),
  getMotivosPerda: () => request<any[]>("/motivos/perda"),

  // Anexos
  getAnexos: (ordemId: number) => request<any[]>(`/anexos/ordem/${ordemId}`),
  uploadAnexo: async (ordemId: number, file: File) => {
    const token = localStorage.getItem("aponta_token");
    const form = new FormData();
    form.append("file", file);
    const res = await fetch(`${BASE}/anexos/upload/${ordemId}`, {
      method: "POST",
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: form,
    });
    return res.json();
  },
};
