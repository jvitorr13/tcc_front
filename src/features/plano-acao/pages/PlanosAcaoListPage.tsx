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

import { useDiagnosticosQuery } from "@/features/diagnosticos";
import { useEmpresasQuery } from "@/features/empresas";

import { PlanosAcaoTable } from "@/features/plano-acao/components/PlanosAcaoTable";
import { usePlanosAcaoQuery } from "@/features/plano-acao/hooks/usePlanosAcaoQuery";
import { usePlanosTarefasCount } from "@/features/plano-acao/hooks/usePlanosTarefasCount";
import type { PlanoAcaoStatus, PlanosAcaoFilters } from "@/features/plano-acao/types/plano-acao.types";

type StatusFilter = "" | PlanoAcaoStatus;

interface PlanosAcaoListLocationState {
  successMessage?: string;
}

/**
 * Tela de Planos de Ação: GET /planos-acao exige empresa_id OU
 * diagnostico_id (confirmado: 400 "informe empresa_id ou diagnostico_id"
 * sem nenhum dos dois) — não existe "listar tudo". Sem filtro de
 * diagnóstico/empresa escolhido, busca-se um filtro por empresa e junta o
 * resultado (ver usePlanosAcaoQuery). Status não tem filtro no back-end —
 * é aplicado no front sobre o resultado já carregado.
 */
export function PlanosAcaoListPage() {
  const location = useLocation();
  const [successMessage] = useState(
    () => (location.state as PlanosAcaoListLocationState | null)?.successMessage ?? null,
  );

  const [search, setSearch] = useState("");

  const [empresaFilter, setEmpresaFilter] = useState("");
  const [diagnosticoFilter, setDiagnosticoFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("");
  const [draftEmpresaFilter, setDraftEmpresaFilter] = useState("");
  const [draftDiagnosticoFilter, setDraftDiagnosticoFilter] = useState("");
  const [draftStatusFilter, setDraftStatusFilter] = useState<StatusFilter>("");

  function handleOpenFilters() {
    setDraftEmpresaFilter(empresaFilter);
    setDraftDiagnosticoFilter(diagnosticoFilter);
    setDraftStatusFilter(statusFilter);
  }

  function handleApplyFilters() {
    setEmpresaFilter(draftEmpresaFilter);
    setDiagnosticoFilter(draftDiagnosticoFilter);
    setStatusFilter(draftStatusFilter);
  }

  function handleClearFilters() {
    setDraftEmpresaFilter("");
    setDraftDiagnosticoFilter("");
    setDraftStatusFilter("");
    setEmpresaFilter("");
    setDiagnosticoFilter("");
    setStatusFilter("");
  }

  const activeFilterCount = (empresaFilter ? 1 : 0) + (diagnosticoFilter ? 1 : 0) + (statusFilter ? 1 : 0);

  const { data: empresas, isLoading: isLoadingEmpresas } = useEmpresasQuery();

  // Diagnósticos só existem pra popular o filtro/nome na tabela — GET
  // /diagnosticos exige empresa_id, então busca por empresa e junta (ver
  // useDiagnosticosQuery, mesmo hook usado em DiagnosticosListPage).
  const empresaIdsParaDiagnosticos = useMemo(() => {
    if (empresaFilter) return [empresaFilter];
    return (empresas ?? []).map((empresa) => empresa.id);
  }, [empresaFilter, empresas]);
  const { data: diagnosticos } = useDiagnosticosQuery(empresaIdsParaDiagnosticos);

  // diagnostico_id sozinho já satisfaz a exigência do back-end (1 request).
  // Só empresa_id, idem. Sem nenhum filtro, precisa de 1 request por
  // empresa pra conseguir listar tudo.
  const planosFilterSets = useMemo<PlanosAcaoFilters[]>(() => {
    if (diagnosticoFilter) return [{ diagnostico_id: diagnosticoFilter, empresa_id: empresaFilter || undefined }];
    if (empresaFilter) return [{ empresa_id: empresaFilter }];
    return (empresas ?? []).map((empresa) => ({ empresa_id: empresa.id }));
  }, [empresaFilter, diagnosticoFilter, empresas]);

  const {
    data: planos,
    isLoading: isLoadingPlanos,
    isError,
    error,
  } = usePlanosAcaoQuery(planosFilterSets);
  const isLoading = isLoadingEmpresas || isLoadingPlanos;

  const empresaNameById = useMemo(() => {
    const map = new Map<string, string>();
    for (const empresa of empresas ?? []) map.set(empresa.id, empresa.nome_fantasia || empresa.razao_social);
    return map;
  }, [empresas]);

  const diagnosticoNameById = useMemo(() => {
    const map = new Map<string, string>();
    for (const diagnostico of diagnosticos ?? []) map.set(diagnostico.id, diagnostico.nome);
    return map;
  }, [diagnosticos]);

  const filteredPlanos = useMemo(() => {
    if (!planos) return [];
    let result = planos;
    if (statusFilter) result = result.filter((plano) => plano.status === statusFilter);

    const term = search.trim().toLowerCase();
    if (term) {
      result = result.filter((plano) => {
        const empresaNome = empresaNameById.get(plano.empresa_id) ?? "";
        return plano.titulo.toLowerCase().includes(term) || empresaNome.toLowerCase().includes(term);
      });
    }
    return result;
  }, [planos, statusFilter, search, empresaNameById]);

  const { page, setPage, totalPages, paginatedItems: paginatedPlanos } = usePagination(filteredPlanos);
  const tarefasCountById = usePlanosTarefasCount(paginatedPlanos.map((plano) => plano.id));

  return (
    <AppLayout>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl text-ink-900">Planos de Ação</h1>
          <p className="mt-1 text-sm text-ink-600">Acompanhe e gerencie as ações de melhoria das empresas.</p>
        </div>
        <Link
          to={ROUTES.planosAcaoNovo}
          className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-ink-900 px-4 text-sm font-medium text-white transition-colors hover:bg-ink-800"
        >
          <Plus size={16} />
          Novo Plano de Ação
        </Link>
      </div>

      <div className="mt-6 max-w-sm">
        <SearchInput
          placeholder="Buscar por título ou empresa"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          aria-label="Buscar planos de ação"
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
            <Label htmlFor="filtro-empresa-plano">Empresa</Label>
            <Select
              id="filtro-empresa-plano"
              value={draftEmpresaFilter}
              onChange={(event) => {
                setDraftEmpresaFilter(event.target.value);
                setDraftDiagnosticoFilter("");
              }}
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
            <Label htmlFor="filtro-diagnostico-plano">Diagnóstico</Label>
            <Select
              id="filtro-diagnostico-plano"
              value={draftDiagnosticoFilter}
              onChange={(event) => setDraftDiagnosticoFilter(event.target.value)}
            >
              <option value="">Todos</option>
              {(diagnosticos ?? [])
                .filter((diagnostico) => !draftEmpresaFilter || diagnostico.empresa_id === draftEmpresaFilter)
                .map((diagnostico) => (
                  <option key={diagnostico.id} value={diagnostico.id}>
                    {diagnostico.nome}
                  </option>
                ))}
            </Select>
          </div>

          <div className="w-full sm:w-56">
            <Label htmlFor="filtro-status-plano">Status</Label>
            <Select
              id="filtro-status-plano"
              value={draftStatusFilter}
              onChange={(event) => setDraftStatusFilter(event.target.value as StatusFilter)}
            >
              <option value="">Todos</option>
              <option value="PENDENTE">Pendente</option>
              <option value="EM_ANDAMENTO">Em andamento</option>
              <option value="CONCLUIDO">Concluído</option>
            </Select>
          </div>
        </AdvancedFilterPanel>
      </div>

      <Card className="mt-6 p-6">
        {successMessage && <SuccessMessage className="mb-5">{successMessage}</SuccessMessage>}

        {isLoading && <Loading label="Carregando planos de ação…" />}

        {isError && (
          <ErrorMessage>{getErrorMessage(error, "Não foi possível carregar os planos de ação.")}</ErrorMessage>
        )}

        {!isLoading && !isError && filteredPlanos.length === 0 && (
          <div className="flex flex-col items-center gap-4 py-10 text-center">
            <p className="text-sm text-ink-500">Nenhum plano de ação encontrado.</p>
            <Link
              to={ROUTES.planosAcaoNovo}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-ink-900 px-4 text-sm font-medium text-white transition-colors hover:bg-ink-800"
            >
              <Plus size={15} />
              Criar primeiro plano
            </Link>
          </div>
        )}

        {!isLoading && !isError && filteredPlanos.length > 0 && (
          <>
            <PlanosAcaoTable
              planos={paginatedPlanos}
              empresaNameById={empresaNameById}
              diagnosticoNameById={diagnosticoNameById}
              tarefasCountById={tarefasCountById}
            />
            <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
          </>
        )}
      </Card>
    </AppLayout>
  );
}
