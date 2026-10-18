/**
 * Apontamento: observação que o CONSULTOR registra sobre uma empresa,
 * opcionalmente ligada a UM diagnóstico e/ou UMA tarefa da mesma empresa.
 * Espelha o objeto de /empresas/{id}/apontamentos e /apontamentos/{id}.
 */
export type ApontamentoVisibilidade = "INTERNA" | "EMPRESA";

export interface Apontamento {
  id: string;
  empresa_id: string;
  consultor_id: string;
  /** Nome do consultor que escreveu — já vem pronto da API. */
  autor_nome: string;
  /** null sem vínculo — ou se o diagnóstico/tarefa foi apagado depois. */
  diagnostico_id: string | null;
  tarefa_id: string | null;
  texto: string;
  /** INTERNA: só o consultor vê. EMPRESA: a empresa também vê. */
  visibilidade: ApontamentoVisibilidade;
  created_at: string;
  updated_at: string;
}

/**
 * POST /empresas/{id}/apontamentos. Sem empresa_id/consultor_id: a empresa
 * vem da URL e o autor, do token.
 */
export interface CreateApontamentoInput {
  texto: string;
  visibilidade: ApontamentoVisibilidade;
  diagnostico_id?: string;
  tarefa_id?: string;
}

/** PUT /apontamentos/{id}: só texto e visibilidade mudam (vínculos não). */
export interface UpdateApontamentoInput {
  texto?: string;
  visibilidade?: ApontamentoVisibilidade;
}

/** Filtros de GET /empresas/{id}/apontamentos (todos opcionais). */
export interface ApontamentosFilters {
  page?: number;
  page_size?: number;
  diagnostico_id?: string;
  tarefa_id?: string;
}

/**
 * Vínculo como a tela mostra/edita: um diagnóstico OU uma tarefa (a API
 * aceitaria os dois juntos, mas o formulário oferece um de cada vez).
 */
export type VinculoTipo = "NENHUM" | "DIAGNOSTICO" | "TAREFA";

export interface VinculoFixo {
  tipo: Exclude<VinculoTipo, "NENHUM">;
  id: string;
  /** Texto exibido no campo travado, ex.: "Tarefa: Padronizar vendas". */
  label: string;
}
