import { AlertCircle, CheckCircle2, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";

import { ErrorMessage } from "@/components/feedback/ErrorMessage";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

import { LikertLegend } from "@/features/diagnosticos/components/LikertLegend";
import { CampoResposta } from "@/features/diagnosticos/components/PerguntaField";
import type { AreaComPerguntas, Pergunta } from "@/features/diagnosticos/types/diagnostico.types";

/** Situação do salvamento da pergunta atual — só pra exibir no rodapé. */
export type StatusResposta = "idle" | "saving" | "saved" | "error";

export interface PerguntaPassoProps {
  area: AreaComPerguntas;
  /** 0-based, entre todas as áreas. */
  areaIndex: number;
  totalAreas: number;
  pergunta: Pergunta;
  /** 0-based, dentro da área. */
  indexNaArea: number;
  value?: string;
  onAnswer: (valor: string) => void;
  status: StatusResposta;
  error?: string;
  isMissing?: boolean;
  hasPrev: boolean;
  onPrev: () => void;
  /** Última pergunta: o botão vira "Revisar respostas". */
  isLast: boolean;
  onNext: () => void;
  onRevisar: () => void;
  onSalvarESair: () => void;
  isSaindo?: boolean;
}

const INSTRUCAO: Record<Pergunta["tipo"], string> = {
  ESCALA: "Escolha o nível que melhor descreve a empresa hoje.",
  SIM_NAO: "Escolha uma das opções.",
  MULTIPLA_ESCOLHA: "Escreva sua resposta. Ela é salva quando você sai do campo.",
  TEXTO: "Escreva sua resposta. Ela é salva quando você sai do campo.",
};

/**
 * Tela da EMPRESA: uma pergunta por vez. Cabeçalho com a área ("Área 2 de 4
 * · Marketing e Vendas"), "Pergunta 3 de 4" (dentro da área) e o selo
 * "Obrigatória". Escolher uma opção já salva (POST /respostas). "Próxima"
 * fica desligado numa obrigatória sem resposta; na última pergunta vira
 * "Revisar respostas". "Salvar e sair" volta pra lista — o back-end deixa
 * continuar depois (as respostas ficam gravadas).
 */
export function PerguntaPasso({
  area,
  areaIndex,
  totalAreas,
  pergunta,
  indexNaArea,
  value,
  onAnswer,
  status,
  error,
  isMissing,
  hasPrev,
  onPrev,
  isLast,
  onNext,
  onRevisar,
  onSalvarESair,
  isSaindo,
}: PerguntaPassoProps) {
  const respondida = value != null && value !== "";
  const bloqueada = pergunta.obrigatoria && !respondida;
  const isEscalaNumerica =
    pergunta.tipo === "ESCALA" &&
    (pergunta.opcoes ?? []).length === 0 &&
    pergunta.escala_min === 1 &&
    pergunta.escala_max === 5;

  return (
    <Card className="p-6 sm:p-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-gold-600">
          Área {areaIndex + 1} de {totalAreas} · {area.nome}
        </p>
        <div className="flex items-center gap-2 text-sm text-ink-500">
          <span>
            Pergunta {indexNaArea + 1} de {area.perguntas.length}
          </span>
          {pergunta.obrigatoria && <Badge variant="gold">Obrigatória</Badge>}
        </div>
      </div>

      <h2 className="mt-4 font-display text-2xl leading-snug text-ink-900 [text-wrap:balance] sm:text-[1.75rem]">
        {pergunta.texto}
      </h2>
      <p className="mt-2 text-sm text-ink-500">{INSTRUCAO[pergunta.tipo] ?? INSTRUCAO.ESCALA}</p>

      {isMissing && !error && (
        <p className="mt-3 flex items-center gap-1.5 text-sm font-medium text-danger-600">
          <AlertCircle size={14} className="shrink-0" />
          Esta pergunta precisa ser respondida para finalizar.
        </p>
      )}

      {isEscalaNumerica && (
        <div className="mt-5">
          <LikertLegend />
        </div>
      )}

      <div className="mt-6">
        <CampoResposta
          // Remonta por pergunta: zera o rascunho do campo de texto ao navegar.
          key={pergunta.id}
          pergunta={pergunta}
          value={value}
          onAnswer={onAnswer}
          large
        />
      </div>

      {error && <ErrorMessage className="mt-3">{error}</ErrorMessage>}

      <div className="mt-8 border-t border-ink-900/8 pt-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Button type="button" variant="secondary" onClick={onPrev} disabled={!hasPrev}>
            <ChevronLeft size={16} />
            Anterior
          </Button>

          <div className="flex items-center gap-2">
            <Button type="button" variant="ghost" onClick={onSalvarESair} isLoading={isSaindo}>
              Salvar e sair
            </Button>
            {isLast ? (
              <Button type="button" onClick={onRevisar} disabled={bloqueada}>
                Revisar respostas
                <ChevronRight size={16} />
              </Button>
            ) : (
              <Button type="button" onClick={onNext} disabled={bloqueada}>
                Próxima
                <ChevronRight size={16} />
              </Button>
            )}
          </div>
        </div>

        <div className="mt-3 flex min-h-5 justify-end text-right text-xs" role="status">
          {status === "saving" && (
            <span className="flex items-center gap-1.5 text-ink-500">
              <Loader2 size={13} className="animate-spin" />
              Salvando…
            </span>
          )}
          {status === "error" && (
            <span className="flex items-center gap-1.5 font-medium text-danger-600">
              <AlertCircle size={13} />
              A resposta não foi salva. Tente escolher de novo.
            </span>
          )}
          {status !== "saving" && status !== "error" && bloqueada && (
            <span className="text-ink-500">
              {pergunta.tipo === "ESCALA"
                ? "Pergunta obrigatória: escolha um nível para continuar."
                : "Pergunta obrigatória: responda para continuar."}
            </span>
          )}
          {status === "saved" && (
            <span className="flex items-center gap-1.5 font-medium text-success-600">
              <CheckCircle2 size={13} />
              Resposta salva
            </span>
          )}
        </div>
      </div>
    </Card>
  );
}
