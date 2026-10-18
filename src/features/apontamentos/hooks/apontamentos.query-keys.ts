import type { ApontamentosFilters } from "@/features/apontamentos/types/apontamento.types";

export const apontamentosQueryKeys = {
  all: ["apontamentos"] as const,
  /** Prefixo de tudo de uma empresa — é o que as mutations invalidam. */
  empresa: (empresaId: string) => ["apontamentos", empresaId] as const,
  list: (empresaId: string, filters: ApontamentosFilters) =>
    [
      "apontamentos",
      empresaId,
      "list",
      filters.page ?? 1,
      filters.page_size ?? 20,
      filters.diagnostico_id ?? "",
      filters.tarefa_id ?? "",
    ] as const,
};
