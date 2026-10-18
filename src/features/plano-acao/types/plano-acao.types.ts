/**
 * Espelha o ActionPlan/Task do backend (internal/plano-acao). Status do
 * plano é sempre derivado das tarefas pelo back-end — não existe campo pra
 * editar isso aqui, nem se calcula nada em paralelo no front.
 */
export type PlanoAcaoStatus = "PENDENTE" | "EM_ANDAMENTO" | "CONCLUIDO";
export type TarefaStatus = "PENDENTE" | "EM_ANDAMENTO" | "CONCLUIDA";
export type TarefaPrioridade = "BAIXA" | "MEDIA" | "ALTA";

export interface PlanoAcao {
  id: string;
  diagnostico_id: string;
  empresa_id: string;
  consultor_id: string;
  titulo: string;
  descricao: string;
  status: PlanoAcaoStatus;
  created_at: string;
  updated_at: string;
}

export interface Tarefa {
  id: string;
  plano_acao_id: string;
  titulo: string;
  descricao: string;
  /** Usuário EMPRESA (da empresa do plano) responsável pela tarefa. */
  responsavel_id: string | null;
  /**
   * Nome do responsável, se o back-end devolver. Tarefas antigas (antes do
   * vínculo por id) só têm este texto livre. A tela prefere o nome do
   * usuário achado por responsavel_id e cai aqui quando não acha.
   */
  responsavel?: string;
  prazo: string | null;
  prioridade: TarefaPrioridade;
  status: TarefaStatus;
  /** Calculado pelo back-end: prazo definido, já vencido e status != CONCLUIDA. Nunca recalcular aqui. */
  observacao: string;
  atrasada: boolean;
  created_at: string;
  updated_at: string;
}

/** GET /planos-acao/:id — mesmo shape de PlanoAcao, com as tarefas aninhadas. */
export interface PlanoAcaoComTarefas extends PlanoAcao {
  tarefas: Tarefa[];
}

export interface CreatePlanoAcaoInput {
  diagnostico_id: string;
  titulo: string;
  descricao?: string;
}

export interface UpdatePlanoAcaoInput {
  titulo?: string;
  descricao?: string;
}

/** GET /planos-acao só filtra por empresa_id/diagnostico_id no back-end — status é filtrado no front. */
export interface PlanosAcaoFilters {
  empresa_id?: string;
  diagnostico_id?: string;
}

export interface CreateTarefaInput {
  titulo: string;
  descricao?: string;
  /** id de um usuário vinculado à empresa do plano de ação. */
  responsavel_id: string;
  prazo?: string;
  prioridade: TarefaPrioridade;
}

/** No uso normal do front só se envia status/observacao (ver PUT /planos-acao/:id/tarefas/:tarefaId). */
export interface UpdateTarefaInput {
  status?: TarefaStatus;
  observacao?: string;
}
