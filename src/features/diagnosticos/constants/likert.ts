/**
 * Rótulos da escala Likert padrão (1-5) usada pelos modelos de diagnóstico.
 * Só se aplica a perguntas com escala_min=1/escala_max=5 — fora disso
 * (ver PerguntaScale) os botões continuam aparecendo sem rótulo textual.
 */
export const LIKERT_LABELS: Record<number, string> = {
  1: "Muito baixo",
  2: "Baixo",
  3: "Médio",
  4: "Alto",
  5: "Muito alto",
};
