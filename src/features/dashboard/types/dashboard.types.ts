import type { TarefaPrioridade, TarefaStatus } from "@/features/plano-acao/types/plano-acao.types";

/**
 * Espelha a resposta de GET /empresas/:id/dashboard. Todos os números já
 * vêm prontos do back-end (soma de tarefas de todos os planos de ação da
 * empresa) — nada aqui é calculado no front, incluindo `percentual_conclusao`
 * (já arredondado a 1 casa) e `tarefas_atrasadas` (mesma regra de `atrasada`
 * usada em /planos-acao/:id/tarefas).
 */
export interface StatusDistribuicao {
  pendente: number;
  em_andamento: number;
  concluida: number;
}

/**
 * Item de `lista_atrasadas` — mesmo filtro do número `tarefas_atrasadas`
 * (prazo antes de hoje em America/Sao_Paulo e status != CONCLUIDA). Já vem
 * ordenada (prazo mais antigo, depois ALTA > MEDIA > BAIXA, depois id) —
 * não reordenar. `dias_atraso` (>= 1) vem pronto, não recalcular.
 */
export interface TarefaAtrasada {
  id: string;
  titulo: string;
  /** Opcional por segurança: sem ele a tela mostra o título sem link. */
  plano_acao_id?: string;
  plano_acao_titulo: string;
  responsavel_id: string;
  responsavel_nome: string;
  /** Data pura "YYYY-MM-DD" — formatar a string, nunca via new Date() (fuso). */
  prazo: string;
  dias_atraso: number;
  prioridade: TarefaPrioridade;
  status: Exclude<TarefaStatus, "CONCLUIDA">;
}

export interface EmpresaDashboard {
  total_tarefas: number;
  tarefas_concluidas: number;
  percentual_conclusao: number;
  tarefas_atrasadas: number;
  /** No máximo 10 itens, nunca null; o total é sempre `tarefas_atrasadas`. */
  lista_atrasadas: TarefaAtrasada[];
  distribuicao_por_status: StatusDistribuicao;
}
