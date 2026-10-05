import { useMemo } from "react";
import { useParams } from "react-router-dom";

import { AppLayout } from "@/layouts/AppLayout";
import { ROUTES } from "@/constants/routes";

import { useEmpresasQuery } from "@/features/empresas";

import { EvolucaoDetalhe } from "@/features/evolucao/components/EvolucaoDetalhe";

/**
 * Drill-down do CONSULTOR a partir da lista de empresas (EvolucoesListPage
 * ou o ícone "Evolução" em EmpresasTable) — uma empresa entre várias, por
 * isso o link de volta e o nome da empresa no cabeçalho. O conteúdo em si é
 * o mesmo componente que a EMPRESA vê direto em /evolucao (ver
 * EvolucaoDetalhe) — nenhuma tela duplicada.
 */
export function EmpresaEvolucaoPage() {
  const { id } = useParams<{ id: string }>();
  const { data: empresas } = useEmpresasQuery();
  const empresa = useMemo(() => (empresas ?? []).find((item) => item.id === id), [empresas, id]);

  if (!id) return null;

  return (
    <AppLayout>
      <EvolucaoDetalhe
        empresaId={id}
        empresaNome={empresa ? empresa.nome_fantasia || empresa.razao_social : "—"}
        voltar={{ to: ROUTES.evolucao, label: "Voltar para Evolução" }}
      />
    </AppLayout>
  );
}
