import { ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";

import { Badge } from "@/components/ui/Badge";
import { diagnosticoDetalhePath } from "@/constants/routes";
import { formatDate, formatDecimal } from "@/utils/format";

import { DIAGNOSTICO_STATUS_LABELS, DIAGNOSTICO_STATUS_VARIANTS } from "@/features/diagnosticos/constants/status";
import type { Diagnostico } from "@/features/diagnosticos/types/diagnostico.types";

export interface DiagnosticosTableProps {
  diagnosticos: Diagnostico[];
  empresaNameById: Map<string, string>;
  modeloNameById: Map<string, string>;
}

/**
 * Linha inteira é um link — não há ação de excluir aqui (diferente de
 * Usuários/Empresas): um diagnóstico é um registro histórico da aplicação
 * de um modelo, não algo que normalmente se apaga.
 */
export function DiagnosticosTable({ diagnosticos, empresaNameById, modeloNameById }: DiagnosticosTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-ink-900/8 text-xs uppercase tracking-wide text-ink-500">
            <th className="py-3 pr-4 font-medium">Empresa</th>
            <th className="py-3 pr-4 font-medium">Modelo</th>
            <th className="py-3 pr-4 font-medium">Status</th>
            <th className="py-3 pr-4 font-medium">Maturidade</th>
            <th className="py-3 pr-4 font-medium">Data</th>
            <th className="py-3 pr-0" />
          </tr>
        </thead>
        <tbody className="divide-y divide-ink-900/6">
          {diagnosticos.map((diagnostico) => (
            <tr key={diagnostico.id} className="group">
              <td className="py-3 pr-4 font-medium text-ink-900">
                {empresaNameById.get(diagnostico.empresa_id) ?? "—"}
              </td>
              <td className="py-3 pr-4 text-ink-600">{modeloNameById.get(diagnostico.modelo_versao_id) ?? "—"}</td>
              <td className="py-3 pr-4">
                <Badge variant={DIAGNOSTICO_STATUS_VARIANTS[diagnostico.status]}>
                  {DIAGNOSTICO_STATUS_LABELS[diagnostico.status]}
                </Badge>
              </td>
              <td className="py-3 pr-4 text-ink-600">
                {diagnostico.nivel_maturidade
                  ? `${diagnostico.nivel_maturidade}${
                      diagnostico.media_geral != null ? ` (${formatDecimal(diagnostico.media_geral)})` : ""
                    }`
                  : "—"}
              </td>
              <td className="py-3 pr-4 text-ink-600">{formatDate(diagnostico.created_at)}</td>
              <td className="py-3 pr-0 text-right">
                <Link
                  to={diagnosticoDetalhePath(diagnostico.id, diagnostico.empresa_id)}
                  className="inline-flex items-center gap-1 text-sm font-medium text-ink-700 transition-colors hover:text-ink-900"
                  aria-label={`Ver diagnóstico de ${empresaNameById.get(diagnostico.empresa_id) ?? diagnostico.nome}`}
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
