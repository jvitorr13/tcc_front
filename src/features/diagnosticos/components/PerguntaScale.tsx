import { AlertCircle } from "lucide-react";

import { cn } from "@/utils/cn";

import { LIKERT_LABELS } from "@/features/diagnosticos/constants/likert";
import type { Pergunta } from "@/features/diagnosticos/types/diagnostico.types";

export interface PerguntaScaleProps {
  pergunta: Pergunta;
  value?: number;
  onAnswer: (valor: number) => void;
  isSaving?: boolean;
  /** Liga o destaque "esta pergunta precisa ser respondida" quando obrigatória e sem resposta. */
  highlightUnanswered?: boolean;
}

/**
 * Uma pergunta + sua escala de resposta (escala_min..escala_max, não
 * necessariamente 1-5). Clicar num valor já dispara onAnswer — quem decide
 * salvar (POST /respostas) e atualizar o estado é a página; este
 * componente só sabe desenhar a escala e avisar qual valor foi clicado.
 */
export function PerguntaScale({ pergunta, value, onAnswer, isSaving, highlightUnanswered }: PerguntaScaleProps) {
  const valores = Array.from(
    { length: pergunta.escala_max - pergunta.escala_min + 1 },
    (_, index) => pergunta.escala_min + index,
  );

  const isMissing = highlightUnanswered && pergunta.obrigatoria && value == null;

  return (
    <div className={cn("py-4", isMissing && "-mx-4 rounded-lg border border-danger-500/30 bg-danger-50/60 px-4")}>
      {isMissing && (
        <p className="mb-2 flex items-center gap-1.5 text-xs font-medium text-danger-600">
          <AlertCircle size={13} className="shrink-0" />
          Esta pergunta precisa ser respondida.
        </p>
      )}

      <p className="text-sm font-medium text-ink-900">
        {pergunta.texto}
        {pergunta.obrigatoria && (
          <span className="ml-1 text-danger-600" aria-label="obrigatória">
            *
          </span>
        )}
      </p>

      <div className="mt-3 flex flex-wrap gap-2" role="radiogroup" aria-label={pergunta.texto}>
        {valores.map((valor) => {
          const label = LIKERT_LABELS[valor];
          return (
            <button
              key={valor}
              type="button"
              role="radio"
              aria-checked={value === valor}
              aria-label={label ? `${valor} - ${label}` : String(valor)}
              title={label}
              onClick={() => onAnswer(valor)}
              disabled={isSaving}
              className={cn(
                "flex size-10 items-center justify-center rounded-lg border text-sm font-medium transition-colors disabled:cursor-wait",
                value === valor
                  ? "border-ink-900 bg-ink-900 text-white"
                  : "border-ink-900/15 text-ink-700 hover:bg-ink-900/5",
              )}
            >
              {valor}
            </button>
          );
        })}
      </div>
    </div>
  );
}
