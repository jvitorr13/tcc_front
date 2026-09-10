import { Plus } from "lucide-react";
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";

import { getErrorMessage } from "@/lib/get-error-message";

import { ErrorMessage } from "@/components/feedback/ErrorMessage";
import { Loading } from "@/components/feedback/Loading";
import { Label } from "@/components/ui/Label";
import { Pagination } from "@/components/ui/Pagination";
import { Select } from "@/components/ui/Select";
import { usePagination } from "@/hooks/usePagination";
import { AppLayout } from "@/layouts/AppLayout";
import { ROUTES } from "@/constants/routes";

import { useEmpresasQuery } from "@/features/empresas";

import { IndicadorCard } from "@/features/indicadores/components/IndicadorCard";
import { useIndicadoresQuery } from "@/features/indicadores/hooks/useIndicadoresQuery";

/**
 * GET /indicadores exige empresa_id — sem filtro escolhido, busca por
 * empresa e junta o resultado (mesmo padrão de Diagnósticos/Planos de
 * Ação). Cards em vez de tabela, seguindo o layout combinado.
 */
export function IndicadoresListPage() {
  const [empresaFilter, setEmpresaFilter] = useState("");

  const { data: empresas, isLoading: isLoadingEmpresas } = useEmpresasQuery();

  const empresaIds = useMemo(() => {
    if (empresaFilter) return [empresaFilter];
    return (empresas ?? []).map((empresa) => empresa.id);
  }, [empresaFilter, empresas]);

  const { data: indicadores, isLoading: isLoadingIndicadores, isError, error } = useIndicadoresQuery(empresaIds);
  const isLoading = isLoadingEmpresas || isLoadingIndicadores;

  const empresaNameById = useMemo(() => {
    const map = new Map<string, string>();
    for (const empresa of empresas ?? []) map.set(empresa.id, empresa.nome_fantasia || empresa.razao_social);
    return map;
  }, [empresas]);

  const { page, setPage, totalPages, paginatedItems: paginatedIndicadores } = usePagination(indicadores ?? []);

  return (
    <AppLayout>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl text-ink-900">Indicadores</h1>
          <p className="mt-1 text-sm text-ink-600">Acompanhe os indicadores de desempenho das empresas.</p>
        </div>
        <Link
          to={ROUTES.indicadoresNovo}
          className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-ink-900 px-4 text-sm font-medium text-white transition-colors hover:bg-ink-800"
        >
          <Plus size={16} />
          Novo indicador
        </Link>
      </div>

      <div className="mt-6 max-w-xs">
        <Label htmlFor="filtro-empresa-indicador">Empresa</Label>
        <Select
          id="filtro-empresa-indicador"
          value={empresaFilter}
          onChange={(event) => setEmpresaFilter(event.target.value)}
        >
          <option value="">Todas</option>
          {(empresas ?? []).map((empresa) => (
            <option key={empresa.id} value={empresa.id}>
              {empresa.nome_fantasia || empresa.razao_social}
            </option>
          ))}
        </Select>
      </div>

      <div className="mt-6">
        {isLoading && <Loading label="Carregando indicadores…" />}

        {isError && <ErrorMessage>{getErrorMessage(error, "Não foi possível carregar os indicadores.")}</ErrorMessage>}

        {!isLoading && !isError && (indicadores ?? []).length === 0 && (
          <div className="flex flex-col items-center gap-4 py-10 text-center">
            <p className="text-sm text-ink-500">Nenhum indicador encontrado.</p>
            <Link
              to={ROUTES.indicadoresNovo}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-ink-900 px-4 text-sm font-medium text-white transition-colors hover:bg-ink-800"
            >
              <Plus size={15} />
              Criar primeiro indicador
            </Link>
          </div>
        )}

        {!isLoading && !isError && (indicadores ?? []).length > 0 && (
          <>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {paginatedIndicadores.map((indicador) => (
                <IndicadorCard key={indicador.id} indicador={indicador} empresaNome={empresaNameById.get(indicador.empresa_id)} />
              ))}
            </div>
            <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
          </>
        )}
      </div>
    </AppLayout>
  );
}
