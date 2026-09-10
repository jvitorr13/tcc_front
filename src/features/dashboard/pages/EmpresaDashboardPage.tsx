import { ArrowLeft } from "lucide-react";
import { useMemo } from "react";
import { Link, useParams } from "react-router-dom";

import { getErrorMessage } from "@/lib/get-error-message";

import { ErrorMessage } from "@/components/feedback/ErrorMessage";
import { Loading } from "@/components/feedback/Loading";
import { Card } from "@/components/ui/Card";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { AppLayout } from "@/layouts/AppLayout";
import { ROUTES } from "@/constants/routes";
import { cn } from "@/utils/cn";
import { formatDecimal } from "@/utils/format";

import { useEmpresasQuery } from "@/features/empresas";

import { StatusDistributionBar } from "@/features/dashboard/components/StatusDistributionBar";
import { useEmpresaDashboardQuery } from "@/features/dashboard/hooks/useEmpresaDashboardQuery";

/**
 * Dashboard de tarefas de uma empresa (GET /empresas/:id/dashboard) — soma
 * de todas as tarefas de todos os planos de ação da empresa. Todos os
 * números (incluindo percentual_conclusao e tarefas_atrasadas) vêm prontos
 * do back-end; nada é calculado aqui. Empresa sem tarefas não é erro — é
 * tratado como estado vazio, não como "carregando" nem falha.
 */
export function EmpresaDashboardPage() {
  const { id } = useParams<{ id: string }>();

  const { data: empresas } = useEmpresasQuery();
  const empresa = useMemo(() => (empresas ?? []).find((item) => item.id === id), [empresas, id]);

  const { data, isLoading, isError, error } = useEmpresaDashboardQuery(id);

  if (isLoading) {
    return (
      <AppLayout>
        <Loading label="Carregando dashboard…" />
      </AppLayout>
    );
  }

  if (isError || !data) {
    return (
      <AppLayout>
        <ErrorMessage>{getErrorMessage(error, "Não foi possível carregar o dashboard.")}</ErrorMessage>
        <Link to={ROUTES.empresas} className="mt-4 inline-block text-sm font-medium text-ink-700 hover:text-ink-900">
          Voltar para Empresas
        </Link>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <Link
        to={ROUTES.empresas}
        className="inline-flex items-center gap-1.5 text-sm font-medium text-ink-600 transition-colors hover:text-ink-900"
      >
        <ArrowLeft size={15} />
        Voltar para Empresas
      </Link>

      <div className="mt-4">
        <h1 className="font-display text-2xl text-ink-900">Dashboard</h1>
        <p className="mt-1 text-sm text-ink-600">
          {empresa ? empresa.nome_fantasia || empresa.razao_social : "—"}
        </p>
      </div>

      {data.total_tarefas === 0 ? (
        <Card className="mt-6 flex flex-col items-center gap-2 px-6 py-16 text-center">
          <p className="text-sm font-medium text-ink-900">Nenhuma tarefa cadastrada ainda.</p>
          <p className="max-w-sm text-sm text-ink-500">
            Assim que um plano de ação desta empresa tiver tarefas, o resumo aparece aqui.
          </p>
        </Card>
      ) : (
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
    </AppLayout>
  );
}
