import { LIKERT_LABELS } from "@/features/diagnosticos/constants/likert";

/**
 * Legenda da escala 1-5, exibida uma única vez acima da lista de perguntas
 * (não repetida em cada pergunta — com muitas perguntas isso só poluiria a
 * tela). Os rótulos vêm de LIKERT_LABELS; se o TCC definir textos
 * diferentes, ajustar só ali.
 */
export function LikertLegend() {
  return (
    <div className="flex flex-wrap gap-x-5 gap-y-1 rounded-lg border border-ink-900/8 bg-ink-900/[0.02] px-4 py-3 text-xs text-ink-600">
      {Object.entries(LIKERT_LABELS).map(([valor, label]) => (
        <span key={valor}>
          <span className="font-medium text-ink-800">{valor}</span> = {label}
        </span>
      ))}
    </div>
  );
}
