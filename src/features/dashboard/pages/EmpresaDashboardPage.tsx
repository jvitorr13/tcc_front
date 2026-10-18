import { ArrowLeft } from "lucide-react";
import { Link, useParams } from "react-router-dom";

import { AppLayout } from "@/layouts/AppLayout";
import { ROUTES } from "@/constants/routes";

import { useEmpresaQuery } from "@/features/empresas";

import { EmpresaDashboardDetalhe } from "@/features/dashboard/components/EmpresaDashboardDetalhe";

/**
 * Drill-down do CONSULTOR: dashboard de uma empresa escolhida em
 * DashboardsListPage (ou pelo ícone na lista de Empresas). A EMPRESA não
 * passa por aqui — vê o próprio direto em /dashboards.
 */
export function EmpresaDashboardPage() {
  const { id } = useParams<{ id: string }>();
  const { data: empresa } = useEmpresaQuery(id);

  if (!id) return null;

  return (
    <AppLayout>
      <EmpresaDashboardDetalhe
        empresaId={id}
        subtitulo={empresa ? empresa.nome_fantasia || empresa.razao_social : undefined}
        voltar={
          <Link
            to={ROUTES.dashboards}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-ink-600 transition-colors hover:text-ink-900"
          >
            <ArrowLeft size={15} />
            Voltar para Dashboards
          </Link>
        }
      />
    </AppLayout>
  );
}
