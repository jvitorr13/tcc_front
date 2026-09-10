import type { PlanosAcaoFilters } from "@/features/plano-acao/types/plano-acao.types";

export const planoAcaoQueryKeys = {
  all: ["planos-acao"] as const,
  list: (filters: PlanosAcaoFilters) => ["planos-acao", "list", filters.empresa_id ?? "", filters.diagnostico_id ?? ""] as const,
  detail: (id: string) => ["planos-acao", "detail", id] as const,
  tarefas: (planoId: string) => ["planos-acao", "tarefas", planoId] as const,
};
