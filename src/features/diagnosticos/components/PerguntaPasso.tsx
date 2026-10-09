import { AlertCircle, CheckCircle2, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

import { PerguntaField } from "@/features/diagnosticos/components/PerguntaField";
import type { AreaComPerguntas, Pergunta } from "@/features/diagnosticos/types/diagnostico.types";

/** Situação do salvamento da pergunta atual — só pra exibir no rodapé. */
export type StatusResposta = "idle" | "saving" | "saved" | "error";

export interface PerguntaPassoProps {
  area: AreaComPerguntas;
  pergunta: Pergunta;
  /** 0-based, contando todas as perguntas de todas as áreas. */
  index: number;
  total: number;
  value?: string;
  onAnswer: (valor: string) => void;
  status: StatusResposta;
  error?: string;
  isMissing?: boolean;
  onPrev: () => void;
  onNext: () => void;
}

/**
 * Tela da EMPRESA: uma pergunta por vez ("Pergunta X de N", com a área em
 * cima). Escolher uma opção já salva (POST /respostas) — o rodapé mostra
 * "Salvando…" / "Resposta salva" / erro, e Anterior/Próxima só navegam
 * (não dependem de salvar). Texto livre salva ao sair do campo.
 */
export function PerguntaPasso({
  area,
  pergunta,
  index,
  total,
  value,
  onAnswer,
  status,
  error,
  isMissing,
  onPrev,
  onNext,
}: PerguntaPassoProps) {
  return (
    <Card className="p-6">
      <p className="font-display text-lg text-ink-900">{area.nome}</p>
      <p className="mt-0.5 text-xs font-medium uppercase tracking-wide text-ink-500">
        Pergunta {index + 1} de {total}
      </p>

      <div className="mt-2">
        <PerguntaField
          // Remonta por pergunta: zera o rascunho do campo de texto ao navegar.
          key={pergunta.id}
          pergunta={pergunta}
          value={value}
          onAnswer={onAnswer}
          error={error}
          isMissing={isMissing}
        />
      </div>

      <div className="mt-4 flex items-center justify-between gap-3 border-t border-ink-900/8 pt-4">
        <Button type="button" variant="ghost" size="sm" onClick={onPrev} disabled={index === 0}>
          <ChevronLeft size={16} />
          Anterior
        </Button>

        <StatusIndicator status={status} />

        <Button type="button" variant="secondary" size="sm" onClick={onNext} disabled={index >= total - 1}>
          Próxima
          <ChevronRight size={16} />
        </Button>
      </div>
    </Card>
  );
}

function StatusIndicator({ status }: { status: StatusResposta }) {
  if (status === "saving") {
    return (
      <span className="flex items-center gap-1.5 text-xs text-ink-500" role="status">
        <Loader2 size={14} className="animate-spin" />
        Salvando…
      </span>
    );
  }
  if (status === "saved") {
    return (
      <span className="flex items-center gap-1.5 text-xs font-medium text-success-600" role="status">
        <CheckCircle2 size={14} />
        Resposta salva
      </span>
    );
  }
  if (status === "error") {
    return (
      <span className="flex items-center gap-1.5 text-xs font-medium text-danger-600" role="status">
        <AlertCircle size={14} />
        Não salva
      </span>
    );
  }
  return <span aria-hidden />;
}
