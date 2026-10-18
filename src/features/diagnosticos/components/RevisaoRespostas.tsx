import { ChevronLeft } from "lucide-react";

import { ErrorMessage } from "@/components/feedback/ErrorMessage";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { cn } from "@/utils/cn";

import type { AreaComPerguntas } from "@/features/diagnosticos/types/diagnostico.types";
import { formatarResposta } from "@/features/diagnosticos/utils/formatar-resposta";

export interface RevisaoRespostasProps {
  areas: AreaComPerguntas[];
  respostas: Map<string, string>;
  /** Vai pra pergunta (índice contando todas as áreas em sequência). */
  onResponder: (indexGlobal: number) => void;
  onVoltar: () => void;
  /** Obrigatórias ainda sem resposta — enquanto houver, "Finalizar" fica desligado. */
  qtdObrigatoriasPendentes: number;
  onFinalizar: () => void;
  isVerificando: boolean;
  confirmando: boolean;
  onConfirmar: () => void;
  onCancelarConfirmacao: () => void;
  isFinalizando: boolean;
  erro?: string | null;
}

/**
 * Revisão antes de finalizar: todas as respostas por área. Sem resposta
 * aparece em amarelo, com "Responder". "Finalizar diagnóstico" só liga sem
 * obrigatória pendente (é a mesma regra do back-end, que confere de novo
 * no POST /finalizar). Finalizar pede confirmação aqui mesmo.
 */
export function RevisaoRespostas({
  areas,
  respostas,
  onResponder,
  onVoltar,
  qtdObrigatoriasPendentes,
  onFinalizar,
  isVerificando,
  confirmando,
  onConfirmar,
  onCancelarConfirmacao,
  isFinalizando,
  erro,
}: RevisaoRespostasProps) {
  let indexGlobal = 0;

  return (
    <Card className="p-6 sm:p-8">
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-gold-600">Revisão</p>
      <h2 className="mt-2 font-display text-2xl text-ink-900">Revisar respostas</h2>
      <p className="mt-1 text-sm text-ink-500">
        Confira antes de finalizar. Depois de finalizar não dá mais para alterar as respostas.
      </p>

      <div className="mt-6 space-y-6">
        {areas.map((area) => (
          <section key={area.id}>
            <h3 className="text-sm font-semibold text-ink-900">{area.nome}</h3>
            <ol className="mt-2 divide-y divide-ink-900/6 rounded-xl border border-ink-900/8">
              {area.perguntas.map((pergunta, indexNaArea) => {
                const index = indexGlobal++;
                const valor = respostas.get(pergunta.id);
                const semResposta = valor == null;
                return (
                  <li
                    key={pergunta.id}
                    className={cn(
                      "flex flex-wrap items-start justify-between gap-3 px-4 py-3",
                      semResposta && "bg-gold-100/60",
                    )}
                  >
                    <div className="min-w-0 flex-1">
                      <p className="text-sm text-ink-900">
                        <span className="mr-1.5 tabular-nums text-ink-500">{indexNaArea + 1}.</span>
                        {pergunta.texto}
                        {pergunta.obrigatoria && semResposta && (
                          <Badge variant="gold" className="ml-2 align-middle">
                            Obrigatória
                          </Badge>
                        )}
                      </p>
                      <p className={cn("mt-1 text-sm", semResposta ? "font-medium text-gold-600" : "text-ink-600")}>
                        {semResposta ? "Sem resposta" : formatarResposta(pergunta, valor)}
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant={semResposta ? "secondary" : "ghost"}
                      size="sm"
                      onClick={() => onResponder(index)}
                    >
                      {semResposta ? "Responder" : "Alterar"}
                    </Button>
                  </li>
                );
              })}
            </ol>
          </section>
        ))}
      </div>

      <div className="mt-8 border-t border-ink-900/8 pt-6">
        {confirmando ? (
          <div className="rounded-xl bg-ink-900/[0.03] p-4">
            <p className="text-sm font-medium text-ink-900">Finalizar diagnóstico?</p>
            <p className="mt-1 text-sm text-ink-600">
              Depois de finalizar não dá mais para alterar as respostas. O resultado é calculado em seguida.
            </p>
            <div className="mt-4 flex flex-wrap gap-3">
              <Button type="button" variant="secondary" onClick={onCancelarConfirmacao} disabled={isFinalizando}>
                Cancelar
              </Button>
              <Button type="button" onClick={onConfirmar} isLoading={isFinalizando}>
                Finalizar
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex flex-wrap items-center justify-between gap-3">
            <Button type="button" variant="secondary" onClick={onVoltar}>
              <ChevronLeft size={16} />
              Voltar às perguntas
            </Button>
            <Button
              type="button"
              onClick={onFinalizar}
              isLoading={isVerificando}
              disabled={qtdObrigatoriasPendentes > 0}
            >
              Finalizar diagnóstico
            </Button>
          </div>
        )}

        {!confirmando && qtdObrigatoriasPendentes > 0 && (
          <p className="mt-3 text-right text-xs text-ink-500">
            {qtdObrigatoriasPendentes === 1
              ? "Falta responder 1 pergunta obrigatória."
              : `Faltam responder ${qtdObrigatoriasPendentes} perguntas obrigatórias.`}
          </p>
        )}
        {erro && <ErrorMessage className="mt-3">{erro}</ErrorMessage>}
      </div>
    </Card>
  );
}
