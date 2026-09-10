import type { IndicadorPeriodicidade, IndicadorSituacao } from "@/features/indicadores/types/indicador.types";

export const PERIODICIDADE_LABELS: Record<IndicadorPeriodicidade, string> = {
  MENSAL: "Mensal",
  TRIMESTRAL: "Trimestral",
  SEMESTRAL: "Semestral",
  ANUAL: "Anual",
};

export const SITUACAO_LABELS: Record<IndicadorSituacao, string> = {
  SEM_DADOS: "Sem dados",
  SEM_META: "Sem meta",
  META_ATINGIDA: "Meta atingida",
  ABAIXO_DA_META: "Abaixo da meta",
};

/** Variantes de Badge por situação — só estilo, o valor em si vem sempre do back-end. */
export const SITUACAO_VARIANTS: Record<IndicadorSituacao, "neutral" | "success" | "danger"> = {
  SEM_DADOS: "neutral",
  SEM_META: "neutral",
  META_ATINGIDA: "success",
  ABAIXO_DA_META: "danger",
};
