import type { ReactNode } from "react";

import { getErrorMessage } from "@/lib/get-error-message";

import { ErrorMessage } from "@/components/feedback/ErrorMessage";
import { Loading } from "@/components/feedback/Loading";
import { Card } from "@/components/ui/Card";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { cn } from "@/utils/cn";
import { formatDecimal } from "@/utils/format";

import { StatusDistributionBar } from "@/features/dashboard/components/StatusDistributionBar";
import { useEmpresaDashboardQuery } from "@/features/dashboard/hooks/useEmpresaDashboardQuery";

export interface EmpresaDashboardDetalheProps {
  empresaId: string;
  /** Linha abaixo do título com o nome da empresa (CONSULTOR vê várias; pra EMPRESA é sempre a própria). */
  subtitulo?: string;
  /** Link de voltar acima do título — só no drill-down do CONSULTOR. */
  voltar?: ReactNode;
}

/**
 * Conteúdo do dashboard de tarefas de uma empresa (GET
 * /empresas/:id/dashboard) — soma de todas as tarefas de todos os planos
 * de ação da empresa. Todos os números vêm prontos do back-end; nada é
 * calculado aqui. Empresa sem tarefas é estado vazio, não erro.
 *
 * Usado nos dois caminhos (mesmo padrão de EvolucaoDetalhe): pelo
 * CONSULTOR em EmpresaDashboardPage e pela EMPRESA direto em
 * DashboardsListPage. A API só deixa a EMPRESA ler o da própria empresa.
 */
export function EmpresaDashboardDetalhe({ empresaId, subtitulo, voltar }: EmpresaDashboardDetalheProps) {
  const { data, isLoading, isError, error } = useEmpresaDashboardQuery(empresaId);

  return (
    <>
      {voltar}

      <div className={voltar ? "mt-4" : undefined}>
        <h1 className="font-display text-2xl text-ink-900">Dashboard</h1>
        {subtitulo && <p className="mt-1 text-sm text-ink-600">{subtitulo}</p>}
      </div>

      {isLoading && (
        <div className="mt-6">
          <Loading label="Carregando dashboard…" />
        </div>
      )}

      {isError && (
        <ErrorMessage className="mt-6">{getErrorMessage(error, "Não foi possível carregar o dashboard.")}</ErrorMessage>
      )}

      {data && data.total_tarefas === 0 && (
        <Card className="mt-6 flex flex-col items-center gap-2 px-6 py-16 text-center">
          <p className="text-sm font-medium text-ink-900">Nenhuma tarefa cadastrada ainda.</p>
          <p className="max-w-sm text-sm text-ink-500">
            Assim que um plano de ação desta empresa tiver tarefas, o resumo aparece aqui.
          </p>
        </Card>
      )}

      {data && data.total_tarefas > 0 && (
        <div className="mt-6 space-y-6">
          <div className="grid gap-4 sm:grid-cols-3">
            <Card className="p-5">
              <p className="text-xs font-medium uppercase tracking-wide text-ink-500">Total de tarefas</p>
              <p className="mt-2 font-display text-3xl text-ink-900">{data.total_tarefas}</p>
            </Card>

            <Card className="p-5">
              <p className="text-xs font-medium uppercase tracking-wide text-ink-500">Concluídas</p>
              <p className="mt-2 font-display text-3xl text-ink-900">{data.tarefas_concluidas}</p>
              <p className="mt-1 text-xs text-ink-500">{formatDecimal(data.percentual_conclusao, 1)}% do total</p>
              <ProgressBar value={data.percentual_conclusao} label="Percentual de conclusão" className="mt-3" />
            </Card>

            <Card className="p-5">
              <p className="text-xs font-medium uppercase tracking-wide text-ink-500">Atrasadas</p>
              <p className={cn("mt-2 font-display text-3xl", data.tarefas_atrasadas > 0 ? "text-danger-600" : "text-ink-900")}>
                {data.tarefas_atrasadas}
              </p>
            </Card>
          </div>

          <Card className="p-6">
            <h2 className="font-display text-lg text-ink-900">Distribuição por status</h2>
            <div className="mt-4">
              <StatusDistributionBar distribuicao={data.distribuicao_por_status} total={data.total_tarefas} />
            </div>
          </Card>
        </div>
      )}
    </>
  );
}
