import { Check } from "lucide-react";
import { Link } from "react-router-dom";

import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { planoAcaoDetalhePath } from "@/constants/routes";

import type { TarefaAtrasada } from "@/features/dashboard/types/dashboard.types";
import type { TarefaPrioridade } from "@/features/plano-acao/types/plano-acao.types";

export interface TarefasAtrasadasCardProps {
  tarefas: TarefaAtrasada[];
  /** `tarefas_atrasadas` do back-end — pode ser maior que a lista (limitada a 10). */
  total: number;
}

const PRIORIDADE_LABELS: Record<TarefaPrioridade, string> = {
  BAIXA: "Baixa",
  MEDIA: "Média",
  ALTA: "Alta",
};

const PRIORIDADE_VARIANTS: Record<TarefaPrioridade, "neutral" | "gold" | "danger"> = {
  BAIXA: "neutral",
  MEDIA: "gold",
  ALTA: "danger",
};

const plural = (n: number, singular: string, pluralForm: string) => `${n} ${n === 1 ? singular : pluralForm}`;

/** "2026-10-20" -> "20/10/2026" direto na string: new Date() leria como UTC e viraria 19/10 no Brasil. */
function formatPrazo(prazo: string): string {
  const [ano, mes, dia] = prazo.split("-");
  return ano && mes && dia ? `${dia}/${mes}/${ano}` : "—";
}

/**
 * Seção "Tarefas atrasadas" do dashboard. Lista, ordem, dias de atraso e
 * total vêm prontos do back-end (mesma regra) — nada é recalculado nem
 * reordenado aqui. A lista vem limitada a 10; a diferença pro total vira
 * "e mais N tarefas atrasadas".
 */
export function TarefasAtrasadasCard({ tarefas, total }: TarefasAtrasadasCardProps) {
  const restantes = total - tarefas.length;

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between gap-3">
        <h2 className="font-display text-lg text-ink-900">Tarefas atrasadas</h2>
        {total > 0 && (
          <Badge variant="danger" className="border border-danger-500/30">
            {plural(total, "tarefa", "tarefas")}
          </Badge>
        )}
      </div>

      {tarefas.length === 0 ? (
        <div className="mt-4 flex items-center gap-3 text-sm text-ink-500">
          <span className="flex size-6 items-center justify-center rounded-full bg-success-50 text-success-600">
            <Check size={14} />
          </span>
          Nenhuma tarefa atrasada.
        </div>
      ) : (
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-ink-900/8 text-xs uppercase tracking-wide text-ink-500">
                <th className="py-3 pl-4 pr-4 font-medium">Tarefa</th>
                <th className="py-3 pr-4 font-medium">Plano de ação</th>
                <th className="py-3 pr-4 font-medium">Responsável</th>
                <th className="py-3 pr-4 font-medium">Prazo</th>
                <th className="py-3 pr-4 font-medium">Atraso</th>
                <th className="py-3 pr-4 font-medium">Prioridade</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-danger-500/10">
              {tarefas.map((tarefa) => (
                <tr key={tarefa.id} className="bg-danger-50/60">
                  <td className="border-l-[3px] border-danger-600 py-3.5 pl-4 pr-4 font-medium text-ink-900">
                    {tarefa.titulo}
                  </td>
                  <td className="py-3.5 pr-4 text-ink-700">
                    {/* Sem plano_acao_id na resposta, fica só o texto — nunca linkar /planos-acao/undefined. */}
                    {tarefa.plano_acao_id ? (
                      <Link
                        to={planoAcaoDetalhePath(String(tarefa.plano_acao_id))}
                        className="transition-colors hover:text-ink-900 hover:underline"
                      >
                        {tarefa.plano_acao_titulo || "—"}
                      </Link>
                    ) : (
                      tarefa.plano_acao_titulo || "—"
                    )}
                  </td>
                  <td className="py-3.5 pr-4 text-ink-700">{tarefa.responsavel_nome || "—"}</td>
                  <td className="py-3.5 pr-4 text-ink-700">{formatPrazo(tarefa.prazo)}</td>
                  <td
                    className="py-3.5 pr-4 font-semibold text-danger-600"
                    title={`${plural(tarefa.dias_atraso, "dia", "dias")} de atraso`}
                  >
                    {plural(tarefa.dias_atraso, "dia", "dias")}
                  </td>
                  <td className="py-3.5 pr-4">
                    <Badge variant={PRIORIDADE_VARIANTS[tarefa.prioridade]} className="py-0.5">
                      {PRIORIDADE_LABELS[tarefa.prioridade]}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {restantes > 0 && (
            <p className="mt-3 text-sm text-ink-500">
              e mais {plural(restantes, "tarefa atrasada", "tarefas atrasadas")}
            </p>
          )}
        </div>
      )}
    </Card>
  );
}
