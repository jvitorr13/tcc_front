import type { NivelMaturidade } from "@/features/evolucao/types/evolucao.types";

export interface NivelMaturidadeInfo {
  /** Posição na escala de 5 passos (1 = Inicial … 5 = Otimizado). */
  nivel: number;
  /** Classificação como aparece na tela (com acento). */
  label: string;
  /** Faixa de média que corresponde ao nível — só informativa. */
  faixa: string;
}

/**
 * Quadro 3 — Classificação proposta dos níveis de maturidade. A API devolve
 * só o CÓDIGO em `nivel_maturidade`; o front troca pelo número do nível e
 * pela classificação desta tabela (PREVISIVEL vira "Previsível").
 *
 * O nível GERAL nunca é recalculado no front: usa sempre o que a API
 * devolveu. O back classifica pela média sem arredondar e `media_geral` vem
 * com 2 casas, então recalcular pode cair em outra faixa na fronteira
 * (ex.: 1,804 aparece como 1,80, mas é nível 2).
 */
export const NIVEIS_MATURIDADE: Record<NivelMaturidade, NivelMaturidadeInfo> = {
  INICIAL: { nivel: 1, label: "Inicial", faixa: "1,00 – 1,80" },
  GERENCIADO: { nivel: 2, label: "Gerenciado", faixa: "1,81 – 2,60" },
  PADRONIZADO: { nivel: 3, label: "Padronizado", faixa: "2,61 – 3,40" },
  PREVISIVEL: { nivel: 4, label: "Previsível", faixa: "3,41 – 4,20" },
  OTIMIZADO: { nivel: 5, label: "Otimizado", faixa: "4,21 – 5,00" },
};

export const TOTAL_NIVEIS_MATURIDADE = 5;

export const NIVEL_MATURIDADE_LABELS: Record<NivelMaturidade, string> = {
  INICIAL: NIVEIS_MATURIDADE.INICIAL.label,
  GERENCIADO: NIVEIS_MATURIDADE.GERENCIADO.label,
  PADRONIZADO: NIVEIS_MATURIDADE.PADRONIZADO.label,
  PREVISIVEL: NIVEIS_MATURIDADE.PREVISIVEL.label,
  OTIMIZADO: NIVEIS_MATURIDADE.OTIMIZADO.label,
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
  GERENCIADO: "bg-gold-100 text-gold-600",
  PADRONIZADO: "bg-ink-900/6 text-ink-600",
  PREVISIVEL: "bg-teal-50 text-teal-600",
  OTIMIZADO: "bg-success-600 text-white",
};

/** Mesmas 5 cores, como `fill-*` para os pontos do gráfico (SVG usa fill, não bg/text). */
export const NIVEL_MATURIDADE_DOT_CLASSES: Record<NivelMaturidade, string> = {
  INICIAL: "fill-danger-600",
  GERENCIADO: "fill-gold-500",
  PADRONIZADO: "fill-ink-600",
  PREVISIVEL: "fill-teal-500",
  OTIMIZADO: "fill-success-600",
};

/** Informações do código vindo da API, ou undefined se for um código que o front não conhece. */
export function getNivelMaturidade(codigo: string | null | undefined): NivelMaturidadeInfo | undefined {
  if (!codigo) return undefined;
  return NIVEIS_MATURIDADE[codigo as NivelMaturidade];
}

/** Texto padrão de exibição: "Nível 3 - Padronizado" (código desconhecido aparece cru). */
export function formatarNivelMaturidade(codigo: string | null | undefined): string {
  const info = getNivelMaturidade(codigo);
  return info ? `Nível ${info.nivel} - ${info.label}` : (codigo ?? "—");
}

/**
 * Nível de uma MÉDIA DE ÁREA (areas[].media vem sem nível). Mesma tabela,
 * com o limite de cima pertencendo à faixa: 2,60 é nível 2; acima de 2,60
 * já é 3. NÃO usar pro nível geral — esse vem pronto da API.
 */
export function nivelPorMedia(media: number): NivelMaturidade {
  if (media > 4.2) return "OTIMIZADO";
  if (media > 3.4) return "PREVISIVEL";
  if (media > 2.6) return "PADRONIZADO";
  if (media > 1.8) return "GERENCIADO";
  return "INICIAL";
}
