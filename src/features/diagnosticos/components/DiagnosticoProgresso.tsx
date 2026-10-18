import { Card } from "@/components/ui/Card";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { Button } from "@/components/ui/Button";
import { cn } from "@/utils/cn";

import type { AreaComPerguntas } from "@/features/diagnosticos/types/diagnostico.types";

export interface DiagnosticoProgressoProps {
  areas: AreaComPerguntas[];
  /** pergunta_id -> valor (só respostas não vazias). */
  respostas: Map<string, string>;
  /** Pergunta na tela agora (undefined na revisão). */
  perguntaAtualId?: string;
  /** Obrigatórias pendentes a destacar (depois de tentar finalizar). */
  missingIds: Set<string>;
  /** Vai pra pergunta clicada — índice contando todas as áreas em sequência. */
  onSelect: (indexGlobal: number) => void;
  onRevisar: () => void;
  revisando: boolean;
}

/**
 * Painel "Seu progresso" da tela de responder: total respondido, barra e,
 * por área, uma bolinha numerada por pergunta. Cheia = respondida; anel
 * dourado = a da tela; vazia = pendente. Clicar leva à pergunta.
 */
export function DiagnosticoProgresso({
  areas,
  respostas,
  perguntaAtualId,
  missingIds,
  onSelect,
  onRevisar,
  revisando,
}: DiagnosticoProgressoProps) {
  const total = areas.reduce((sum, area) => sum + area.perguntas.length, 0);
  const respondidas = areas.reduce(
    (sum, area) => sum + area.perguntas.filter((pergunta) => respostas.has(pergunta.id)).length,
    0,
  );

  let indexGlobal = 0;

  return (
    <Card className="p-6">
      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-ink-500">Seu progresso</p>
      <p className="mt-2 flex items-baseline gap-2">
        <span className="font-display text-3xl text-ink-900">
          {respondidas} de {total}
        </span>
        <span className="text-sm text-ink-500">respondidas</span>
      </p>
      <ProgressBar value={total > 0 ? (respondidas / total) * 100 : 0} label="Perguntas respondidas" className="mt-3" />

      <div className="mt-6 space-y-5">
        {areas.map((area) => {
          const respondidasArea = area.perguntas.filter((pergunta) => respostas.has(pergunta.id)).length;
          return (
            <div key={area.id}>
              <div className="flex items-center justify-between gap-3 text-sm">
                <span className="font-medium text-ink-900">{area.nome}</span>
                <span className="tabular-nums text-ink-500">
                  {respondidasArea}/{area.perguntas.length}
                </span>
              </div>
              <div className="mt-2.5 flex flex-wrap gap-2">
                {area.perguntas.map((pergunta, indexNaArea) => {
                  const index = indexGlobal++;
                  const respondida = respostas.has(pergunta.id);
                  const atual = pergunta.id === perguntaAtualId;
                  const faltando = missingIds.has(pergunta.id);
                  return (
                    <button
                      key={pergunta.id}
                      type="button"
                      onClick={() => onSelect(index)}
                      aria-current={atual ? "step" : undefined}
                      aria-label={`${area.nome}, pergunta ${indexNaArea + 1}${respondida ? ", respondida" : ", sem resposta"}`}
                      title={pergunta.texto}
                      className={cn(
                        "flex size-10 items-center justify-center rounded-full border text-sm font-medium transition-colors",
                        "focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-500/50",
                        atual
                          ? "border-gold-500 bg-gold-100 text-ink-900 ring-2 ring-gold-500/40 ring-offset-1"
                          : respondida
                            ? "border-ink-900 bg-ink-900 text-white hover:bg-ink-800"
                            : faltando
                              ? "border-danger-500 bg-danger-50 text-danger-600"
                              : "border-ink-900/15 bg-surface text-ink-700 hover:border-ink-900/30",
                      )}
                    >
                      {indexNaArea + 1}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      <Button
        type="button"
        variant="secondary"
        className="mt-6 w-full"
        onClick={onRevisar}
        disabled={revisando}
      >
        Revisar respostas
      </Button>
    </Card>
  );
}
