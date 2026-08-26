import { Plus } from "lucide-react";
import { useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";

import { getErrorMessage } from "@/lib/get-error-message";

import { ErrorMessage } from "@/components/feedback/ErrorMessage";
import { Loading } from "@/components/feedback/Loading";
import { SuccessMessage } from "@/components/feedback/SuccessMessage";
import { AdvancedFilterPanel } from "@/components/ui/AdvancedFilterPanel";
import { Card } from "@/components/ui/Card";
import { Label } from "@/components/ui/Label";
import { Pagination } from "@/components/ui/Pagination";
import { SearchInput } from "@/components/ui/SearchInput";
import { Select } from "@/components/ui/Select";
import { usePagination } from "@/hooks/usePagination";
import { AppLayout } from "@/layouts/AppLayout";
import { ROUTES } from "@/constants/routes";

import { useEmpresasQuery } from "@/features/empresas";
import { useModelosQuery } from "@/features/questionario";

import { DiagnosticosTable } from "@/features/diagnosticos/components/DiagnosticosTable";
import { useDiagnosticosQuery } from "@/features/diagnosticos/hooks/useDiagnosticosQuery";
import type { DiagnosticoStatus } from "@/features/diagnosticos/types/diagnostico.types";

type StatusFilter = "" | DiagnosticoStatus;

interface DiagnosticosListLocationState {
  successMessage?: string;
}

/**
 * Tela de Diagnósticos: lista de todos os diagnósticos aplicados (qualquer
 * empresa), com busca, filtros por empresa/status e paginação — mesmo
 * padrão arquitetural das telas de Usuários/Empresas. Cada linha leva para
 * a tela de detalhe (DiagnosticoDetalhePage), que mostra o formulário de
 * perguntas ou o resultado, dependendo do status.
 */
export function DiagnosticosListPage() {
  const location = useLocation();
  const [successMessage] = useState(
    () => (location.state as DiagnosticosListLocationState | null)?.successMessage ?? null,
  );

  const [search, setSearch] = useState("");

  const [empresaFilter, setEmpresaFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("");
  const [draftEmpresaFilter, setDraftEmpresaFilter] = useState("");
  const [draftStatusFilter, setDraftStatusFilter] = useState<StatusFilter>("");

  function handleOpenFilters() {
    setDraftEmpresaFilter(empresaFilter);
    setDraftStatusFilter(statusFilter);
  }

  function handleApplyFilters() {
    setEmpresaFilter(draftEmpresaFilter);
    setStatusFilter(draftStatusFilter);
  }

  function handleClearFilters() {
    setDraftEmpresaFilter("");
    setDraftStatusFilter("");
    setEmpresaFilter("");
    setStatusFilter("");
  }

  const activeFilterCount = (empresaFilter ? 1 : 0) + (statusFilter ? 1 : 0);

  const { data: empresas, isLoading: isLoadingEmpresas } = useEmpresasQuery();
  const { data: modelos } = useModelosQuery();

  // Não existe "listar diagnósticos de todas as empresas" no backend (GET
  // /diagnosticos exige empresa_id) — sem filtro de empresa, busca-se uma
  // vez por empresa e junta tudo (ver useDiagnosticosQuery).
  const empresaIds = useMemo(() => {
    if (empresaFilter) return [empresaFilter];
    return (empresas ?? []).map((empresa) => empresa.id);
  }, [empresaFilter, empresas]);

  const {
    data: diagnosticos,
    isLoading: isLoadingDiagnosticos,
    isError,
    error,
  } = useDiagnosticosQuery(empresaIds, statusFilter || undefined);
  const isLoading = isLoadingEmpresas || isLoadingDiagnosticos;

  const empresaNameById = useMemo(() => {
    const map = new Map<string, string>();
    for (const empresa of empresas ?? []) map.set(empresa.id, empresa.nome_fantasia || empresa.razao_social);
    return map;
  }, [empresas]);

  const modeloNameById = useMemo(() => {
    const map = new Map<string, string>();
    for (const modelo of modelos ?? []) map.set(modelo.id, modelo.nome);
    return map;
  }, [modelos]);

  const filteredDiagnosticos = useMemo(() => {
    if (!diagnosticos) return [];
    const term = search.trim().toLowerCase();
    if (!term) return diagnosticos;
    return diagnosticos.filter((diagnostico) => {
      const empresaNome = empresaNameById.get(diagnostico.empresa_id) ?? "";
      return diagnostico.nome.toLowerCase().includes(term) || empresaNome.toLowerCase().includes(term);
    });
  }, [diagnosticos, search, empresaNameById]);

  const { page, setPage, totalPages, paginatedItems: paginatedDiagnosticos } = usePagination(filteredDiagnosticos);

  return (
    <AppLayout>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-2xl text-ink-900">Diagnósticos</h1>
        <Link
          to={ROUTES.diagnosticosNovo}
          className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-ink-900 px-4 text-sm font-medium text-white transition-colors hover:bg-ink-800"
        >
          <Plus size={16} />
          Novo diagnóstico
        </Link>
      </div>

      <div className="mt-6 max-w-sm">
        <SearchInput
          placeholder="Buscar por nome ou empresa"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          aria-label="Buscar diagnósticos"
        />
      </div>

      <div className="mt-3">
        <AdvancedFilterPanel
          activeCount={activeFilterCount}
          onOpen={handleOpenFilters}
          onApply={handleApplyFilters}
          onClear={handleClearFilters}
        >
          <div className="w-full sm:w-56">
            <Label htmlFor="filtro-empresa-diagnostico">Empresa</Label>
            <Select
              id="filtro-empresa-diagnostico"
              value={draftEmpresaFilter}
              onChange={(event) => setDraftEmpresaFilter(event.target.value)}
            >
              <option value="">Todas</option>
              {(empresas ?? []).map((empresa) => (
                <option key={empresa.id} value={empresa.id}>
                  {empresa.nome_fantasia || empresa.razao_social}
                </option>
              ))}
            </Select>
          </div>

          <div className="w-full sm:w-56">
            <Label htmlFor="filtro-status-diagnostico">Status</Label>
            <Select
              id="filtro-status-diagnostico"
              value={draftStatusFilter}
              onChange={(event) => setDraftStatusFilter(event.target.value as StatusFilter)}
            >
              <option value="">Todos</option>
              <option value="RASCUNHO">Rascunho</option>
              <option value="EM_ANDAMENTO">Em andamento</option>
              <option value="CONCLUIDO">Concluído</option>
            </Select>
          </div>
        </AdvancedFilterPanel>
      </div>

      <Card className="mt-6 p-6">
        {successMessage && <SuccessMessage className="mb-5">{successMessage}</SuccessMessage>}

        {isLoading && <Loading label="Carregando diagnósticos…" />}

        {isError && (
          <ErrorMessage>{getErrorMessage(error, "Não foi possível carregar os diagnósticos.")}</ErrorMessage>
        )}

        {!isLoading && !isError && filteredDiagnosticos.length === 0 && (
          <p className="py-10 text-center text-sm text-ink-500">Nenhum diagnóstico encontrado.</p>
        )}

        {!isLoading && !isError && filteredDiagnosticos.length > 0 && (
          <>
            <DiagnosticosTable
              diagnosticos={paginatedDiagnosticos}
              empresaNameById={empresaNameById}
              modeloNameById={modeloNameById}
            />
            <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
          </>
        )}
      </Card>
    </AppLayout>
  );
}
