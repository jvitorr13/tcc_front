import type { NivelMaturidade } from "@/features/evolucao/types/evolucao.types";

export const NIVEL_MATURIDADE_LABELS: Record<NivelMaturidade, string> = {
  INICIAL: "Inicial",
  BASICO: "Básico",
  ESTRUTURADO: "Estruturado",
  GERENCIADO: "Gerenciado",
  OTIMIZADO: "Otimizado",
};

/**
 * Escala de cor fixa do mais fraco ao mais forte — são só 5 estados
 * conhecidos, nunca gerar cor dinamicamente. Usa só tokens já existentes no
 * design system (danger/gold/ink/success), não cores novas.
 */
export const NIVEL_MATURIDADE_CLASSES: Record<NivelMaturidade, string> = {
  INICIAL: "bg-danger-50 text-danger-600",
  BASICO: "bg-gold-100 text-gold-600",
  ESTRUTURADO: "bg-ink-900/6 text-ink-600",
  GERENCIADO: "bg-success-50 text-success-600",
  OTIMIZADO: "bg-success-600 text-white",
};
