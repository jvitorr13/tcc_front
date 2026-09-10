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

export interface EmpresaDashboard {
  total_tarefas: number;
  tarefas_concluidas: number;
  percentual_conclusao: number;
  tarefas_atrasadas: number;
  distribuicao_por_status: StatusDistribuicao;
}
