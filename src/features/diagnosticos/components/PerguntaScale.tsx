import { cn } from "@/utils/cn";

import type { Pergunta } from "@/features/diagnosticos/types/diagnostico.types";

export interface PerguntaScaleProps {
  pergunta: Pergunta;
  value?: number;
  onAnswer: (valor: number) => void;
  isSaving?: boolean;
}

/**
 * Uma pergunta + sua escala de resposta (escala_min..escala_max, não
 * necessariamente 1-5). Clicar num valor já dispara onAnswer — quem decide
 * salvar (POST /respostas) e atualizar o estado é a página; este
 * componente só sabe desenhar a escala e avisar qual valor foi clicado.
 */
export function PerguntaScale({ pergunta, value, onAnswer, isSaving }: PerguntaScaleProps) {
  const valores = Array.from(
    { length: pergunta.escala_max - pergunta.escala_min + 1 },
    (_, index) => pergunta.escala_min + index,
  );

  return (
    <div className="py-4">
      <p className="text-sm font-medium text-ink-900">
        {pergunta.texto}
        {pergunta.obrigatoria && (
          <span className="ml-1 text-danger-600" aria-label="obrigatória">
            *
          </span>
        )}
      </p>

      <div className="mt-3 flex flex-wrap gap-2" role="radiogroup" aria-label={pergunta.texto}>
        {valores.map((valor) => (
          <button
            key={valor}
            type="button"
            role="radio"
            aria-checked={value === valor}
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
        ))}
      </div>
    </div>
  );
}
