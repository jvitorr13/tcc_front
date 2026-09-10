import { ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";

import { Badge } from "@/components/ui/Badge";
import { planoAcaoDetalhePath } from "@/constants/routes";
import { formatDate } from "@/utils/format";

import type { PlanoAcao, PlanoAcaoStatus } from "@/features/plano-acao/types/plano-acao.types";

export interface PlanosAcaoTableProps {
  planos: PlanoAcao[];
  empresaNameById: Map<string, string>;
  diagnosticoNameById: Map<string, string>;
  tarefasCountById: Map<string, number>;
}

const STATUS_LABELS: Record<PlanoAcaoStatus, string> = {
  PENDENTE: "Pendente",
  EM_ANDAMENTO: "Em andamento",
  CONCLUIDO: "Concluído",
};

const STATUS_VARIANTS: Record<PlanoAcaoStatus, "neutral" | "gold" | "success"> = {
  PENDENTE: "neutral",
  EM_ANDAMENTO: "gold",
  CONCLUIDO: "success",
};

/**
 * A quantidade de tarefas vem de GET /planos-acao/:id/tarefas por plano
 * (endpoint já existente) — ver usePlanosTarefasCount, chamado só para os
 * planos da página atual. GET /planos-acao (lista) não traz `tarefas`.
 */
export function PlanosAcaoTable({ planos, empresaNameById, diagnosticoNameById, tarefasCountById }: PlanosAcaoTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-ink-900/8 text-xs uppercase tracking-wide text-ink-500">
            <th className="py-3 pr-4 font-medium">Plano</th>
            <th className="py-3 pr-4 font-medium">Empresa</th>
            <th className="py-3 pr-4 font-medium">Diagnóstico</th>
            <th className="py-3 pr-4 font-medium">Tarefas</th>
            <th className="py-3 pr-4 font-medium">Status</th>
            <th className="py-3 pr-4 font-medium">Criado em</th>
            <th className="py-3 pr-0" />
          </tr>
        </thead>
        <tbody className="divide-y divide-ink-900/6">
          {planos.map((plano) => (
            <tr key={plano.id}>
              <td className="py-3 pr-4 font-medium text-ink-900">{plano.titulo}</td>
              <td className="py-3 pr-4 text-ink-600">{empresaNameById.get(plano.empresa_id) ?? "—"}</td>
              <td className="py-3 pr-4 text-ink-600">{diagnosticoNameById.get(plano.diagnostico_id) ?? "—"}</td>
              <td className="py-3 pr-4 text-ink-600">{tarefasCountById.get(plano.id) ?? "—"}</td>
              <td className="py-3 pr-4">
                <Badge variant={STATUS_VARIANTS[plano.status]}>{STATUS_LABELS[plano.status]}</Badge>
              </td>
              <td className="py-3 pr-4 text-ink-600">{formatDate(plano.created_at)}</td>
              <td className="py-3 pr-0 text-right">
                <Link
                  to={planoAcaoDetalhePath(plano.id)}
                  className="inline-flex items-center gap-1 text-sm font-medium text-ink-700 transition-colors hover:text-ink-900"
                  aria-label={`Ver plano ${plano.titulo}`}
                >
                  Ver
                  <ChevronRight size={15} />
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
