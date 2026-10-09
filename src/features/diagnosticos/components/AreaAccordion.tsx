import { ChevronDown } from "lucide-react";

import { Card } from "@/components/ui/Card";
import { cn } from "@/utils/cn";

import { PerguntaField } from "@/features/diagnosticos/components/PerguntaField";
import type { AreaComPerguntas, Pergunta } from "@/features/diagnosticos/types/diagnostico.types";

export interface AreaAccordionProps {
  area: AreaComPerguntas;
  /** pergunta_id -> valor (string, como a API grava). Só respostas não vazias. */
  respostas: Map<string, string>;
  onAnswer?: (pergunta: Pergunta, valor: string) => void;
  expanded: boolean;
  onToggle: () => void;
  /** Perguntas a destacar como "precisa ser respondida" — ver DiagnosticoDetalhePage. */
  missingIds?: Set<string>;
  /** Erro 400 de POST /respostas por pergunta, mostrado junto ao campo. */
  errorsByPergunta?: Map<string, string>;
  /** Repassado para cada PerguntaField — ver PerguntaField.readOnly. */
  readOnly?: boolean;
}

/**
 * Uma área do modelo, recolhível — evita uma rolagem infinita quando o
 * diagnóstico tem muitas perguntas espalhadas por várias áreas. O contador
 * "X/Y respondidas" fica visível mesmo com a área fechada.
 */
export function AreaAccordion({
  area,
  respostas,
  onAnswer,
  expanded,
  onToggle,
  missingIds,
  errorsByPergunta,
  readOnly,
}: AreaAccordionProps) {
  const respondidas = area.perguntas.filter((pergunta) => respostas.has(pergunta.id)).length;

  return (
    <Card className="overflow-hidden p-0">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={expanded}
        className="flex w-full items-center justify-between gap-3 px-6 py-4 text-left transition-colors hover:bg-ink-900/[0.02]"
      >
        <h2 className="font-display text-lg text-ink-900">{area.nome}</h2>
        <div className="flex items-center gap-3 shrink-0 text-sm text-ink-500">
          <span>
            {respondidas}/{area.perguntas.length} respondidas
          </span>
          <ChevronDown size={18} className={cn("transition-transform", expanded && "rotate-180")} />
        </div>
      </button>

      {expanded && (
        <div className="divide-y divide-ink-900/6 border-t border-ink-900/6 px-6">
          {area.perguntas.map((pergunta) => (
            <PerguntaField
              key={pergunta.id}
              pergunta={pergunta}
              value={respostas.get(pergunta.id)}
              onAnswer={readOnly ? undefined : (valor) => onAnswer?.(pergunta, valor)}
              isMissing={missingIds?.has(pergunta.id)}
              error={errorsByPergunta?.get(pergunta.id)}
              readOnly={readOnly}
            />
          ))}
        </div>
      )}
    </Card>
  );
}
