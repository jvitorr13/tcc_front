import { ArrowLeft } from "lucide-react";
import { useMemo } from "react";
import { Link, useParams } from "react-router-dom";

import { getErrorMessage } from "@/lib/get-error-message";

import { ErrorMessage } from "@/components/feedback/ErrorMessage";
import { Loading } from "@/components/feedback/Loading";
import { Card } from "@/components/ui/Card";
import { AppLayout } from "@/layouts/AppLayout";
import { ROUTES } from "@/constants/routes";
import { formatDecimal } from "@/utils/format";

import { useEmpresasQuery } from "@/features/empresas";

import { EvolucaoChart } from "@/features/evolucao/components/EvolucaoChart";
import { VariacaoBadge } from "@/features/evolucao/components/VariacaoBadge";
import { useEmpresaEvolucaoQuery } from "@/features/evolucao/hooks/useEmpresaEvolucaoQuery";

/**
 * Evolução da média geral de uma empresa ao longo dos diagnósticos
 * concluídos (GET /empresas/:id/evolucao). Só entram diagnósticos
 * CONCLUIDO com resultado já calculado — um diagnóstico recém-finalizado
 * pode "sumir" daqui por um tempo até o cálculo rodar; isso é esperado, não
 * é bug.
 */
export function EmpresaEvolucaoPage() {
  const { id } = useParams<{ id: string }>();

  const { data: empresas } = useEmpresasQuery();
  const empresa = useMemo(() => (empresas ?? []).find((item) => item.id === id), [empresas, id]);

  const { data, isLoading, isError, error } = useEmpresaEvolucaoQuery(id);

  if (isLoading) {
    return (
      <AppLayout>
        <Loading label="Carregando evolução…" />
      </AppLayout>
    );
  }

  if (isError || !data) {
    return (
      <AppLayout>
        <ErrorMessage>{getErrorMessage(error, "Não foi possível carregar a evolução.")}</ErrorMessage>
        <Link to={ROUTES.empresas} className="mt-4 inline-block text-sm font-medium text-ink-700 hover:text-ink-900">
          Voltar para Empresas
        </Link>
      </AppLayout>
    );
  }

  const ultimoDiagnostico = data.diagnosticos[data.diagnosticos.length - 1];

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
        <h1 className="font-display text-2xl text-ink-900">Evolução</h1>
        <p className="mt-1 text-sm text-ink-600">{empresa ? empresa.nome_fantasia || empresa.razao_social : "—"}</p>
      </div>

      <div className="mt-4">
        <VariacaoBadge variacao={data.variacao_media_geral} desde={data.variacao_desde} />
      </div>

      <Card className="mt-6 p-6">
        <h2 className="font-display text-lg text-ink-900">Evolução da média geral</h2>

        {data.diagnosticos.length === 0 ? (
          <p className="py-10 text-center text-sm text-ink-500">Nenhum diagnóstico concluído ainda.</p>
        ) : (
          <div className="mt-4">
            <EvolucaoChart diagnosticos={data.diagnosticos} />
          </div>
        )}
      </Card>

      {ultimoDiagnostico && ultimoDiagnostico.areas.length > 0 && (
        <Card className="mt-6 p-6">
          <h2 className="font-display text-lg text-ink-900">Por área · último diagnóstico</h2>
          <div className="mt-4 grid grid-cols-1 gap-x-8 gap-y-2.5 sm:grid-cols-2">
            {ultimoDiagnostico.areas.map((area) => (
              <div key={area.nome} className="flex items-center justify-between text-sm">
                <span className="text-ink-700">{area.nome}</span>
                <span className="font-medium text-ink-900">{formatDecimal(area.media)}</span>
              </div>
            ))}
          </div>
        </Card>
      )}
    </AppLayout>
  );
}
