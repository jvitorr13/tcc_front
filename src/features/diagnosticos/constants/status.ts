import type { DiagnosticoStatus } from "@/features/diagnosticos/types/diagnostico.types";

export const DIAGNOSTICO_STATUS_LABELS: Record<DiagnosticoStatus, string> = {
  RASCUNHO: "Rascunho",
  PENDENTE: "Aguardando respostas",
  EM_ANDAMENTO: "Em andamento",
  CONCLUIDO: "Concluído",
};

export const DIAGNOSTICO_STATUS_VARIANTS: Record<DiagnosticoStatus, "neutral" | "gold" | "success"> = {
  RASCUNHO: "neutral",
  PENDENTE: "neutral",
  EM_ANDAMENTO: "gold",
  CONCLUIDO: "success",
};
