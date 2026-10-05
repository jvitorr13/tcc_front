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
 * conhecidos, nunca gerar cor dinamicamente. Mesmo mapa usado no badge de
 * texto e nos pontos do gráfico de evolução (NIVEL_MATURIDADE_DOT_CLASSES
 * abaixo) — uma constante só, para não repetir a lógica de cor em dois
 * componentes.
 */
export const NIVEL_MATURIDADE_CLASSES: Record<NivelMaturidade, string> = {
  INICIAL: "bg-danger-50 text-danger-600",
  BASICO: "bg-gold-100 text-gold-600",
  ESTRUTURADO: "bg-ink-900/6 text-ink-600",
  GERENCIADO: "bg-teal-50 text-teal-600",
  OTIMIZADO: "bg-success-600 text-white",
};

/** Mesmas 5 cores, como `fill-*` para os pontos do gráfico (SVG usa fill, não bg/text). */
export const NIVEL_MATURIDADE_DOT_CLASSES: Record<NivelMaturidade, string> = {
  INICIAL: "fill-danger-600",
  BASICO: "fill-gold-500",
  ESTRUTURADO: "fill-ink-600",
  GERENCIADO: "fill-teal-500",
  OTIMIZADO: "fill-success-600",
};
