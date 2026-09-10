import { formatDate, formatDecimal } from "@/utils/format";

import type { IndicadorValor } from "@/features/indicadores/types/indicador.types";

export interface IndicadorValoresTableProps {
  valores: IndicadorValor[];
  unidade: string;
}

/** Mais recente primeiro — a data_referencia decide a ordem, nunca created_at. */
export function IndicadorValoresTable({ valores, unidade }: IndicadorValoresTableProps) {
  const ordenados = [...valores].sort(
    (a, b) => new Date(b.data_referencia).getTime() - new Date(a.data_referencia).getTime(),
  );

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-ink-900/8 text-xs uppercase tracking-wide text-ink-500">
            <th className="py-3 pr-4 font-medium">Data de referência</th>
            <th className="py-3 pr-4 font-medium">Valor</th>
            <th className="py-3 pr-0 font-medium">Observação</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-ink-900/6">
          {ordenados.map((valor) => (
            <tr key={valor.id}>
              <td className="py-3 pr-4 text-ink-600">{formatDate(valor.data_referencia)}</td>
              <td className="py-3 pr-4 font-medium text-ink-900">
                {unidade} {formatDecimal(valor.valor)}
              </td>
              <td className="py-3 pr-0 text-ink-600">{valor.observacao || "—"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
