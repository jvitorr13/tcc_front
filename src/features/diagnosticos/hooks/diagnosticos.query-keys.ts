import type { DiagnosticoStatus } from "@/features/diagnosticos/types/diagnostico.types";

export const diagnosticosQueryKeys = {
  all: ["diagnosticos"] as const,
  list: (empresaId: string, status?: DiagnosticoStatus) =>
    ["diagnosticos", "list", empresaId, status] as const,
  detail: (id: string, empresaId: string) => ["diagnosticos", "detail", id, empresaId] as const,
  perguntas: (id: string) => ["diagnosticos", id, "perguntas"] as const,
  respostas: (id: string) => ["diagnosticos", id, "respostas"] as const,
  pendencias: (id: string) => ["diagnosticos", id, "pendencias"] as const,
  resultado: (id: string) => ["diagnosticos", id, "resultado"] as const,
};
