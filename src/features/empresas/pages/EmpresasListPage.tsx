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

import { EmpresasTable } from "@/features/empresas/components/EmpresasTable";
import { useDeleteEmpresaMutation } from "@/features/empresas/hooks/useDeleteEmpresaMutation";
import { useEmpresasQuery } from "@/features/empresas/hooks/useEmpresasQuery";
import type { Empresa } from "@/features/empresas/types/empresa.types";

type StatusFilter = "" | "ativa" | "inativa";

interface EmpresasListLocationState {
  successMessage?: string;
}

/**
 * Tela de Empresas: lista + busca por nome/CNPJ + editar/excluir. Mesmo
 * padrão arquitetural da tela de Usuários (ver UsersListPage) — a busca é
 * feita client-side sobre a lista já carregada (ver empresasService.list).
 */
export function EmpresasListPage() {
  const location = useLocation();
  const [successMessage] = useState(
    () => (location.state as EmpresasListLocationState | null)?.successMessage ?? null,
  );

  const [search, setSearch] = useState("");

  // Filtro aplicado (dirige a lista) e "rascunho" editado dentro do
  // AdvancedFilterPanel — só vira filtro de verdade em "Aplicar filtros"
  // (mesmo padrão de UsersListPage).
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("");
  const [draftStatusFilter, setDraftStatusFilter] = useState<StatusFilter>("");

  function handleOpenFilters() {
    setDraftStatusFilter(statusFilter);
  }

  function handleApplyFilters() {
    setStatusFilter(draftStatusFilter);
  }

  function handleClearFilters() {
    setDraftStatusFilter("");
    setStatusFilter("");
  }

  const { data: empresas, isLoading, isError, error } = useEmpresasQuery({ incluirInativas: true });

  const filteredEmpresas = useMemo(() => {
    if (!empresas) return [];
    const term = search.trim().toLowerCase();
    return empresas.filter((empresa) => {
      const matchesTerm =
        !term ||
        empresa.razao_social.toLowerCase().includes(term) ||
        empresa.nome_fantasia.toLowerCase().includes(term) ||
        empresa.cnpj.toLowerCase().includes(term);
      const matchesStatus = statusFilter === "" || empresa.ativo === (statusFilter === "ativa");
      return matchesTerm && matchesStatus;
    });
  }, [empresas, search, statusFilter]);

  const activeFilterCount = statusFilter ? 1 : 0;
  const { page, setPage, totalPages, paginatedItems: paginatedEmpresas } = usePagination(filteredEmpresas);

  const deleteMutation = useDeleteEmpresaMutation();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function handleDelete(empresa: Empresa) {
    setDeletingId(empresa.id);
    try {
      await deleteMutation.mutateAsync(empresa.id);
    } catch {
      // erro de exclusão fica silencioso por ora, mesma decisão do UsersListPage
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <AppLayout>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-2xl text-ink-900">Empresas</h1>
        <Link
          to={ROUTES.empresasNovo}
          className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-ink-900 px-4 text-sm font-medium text-white transition-colors hover:bg-ink-800"
        >
          <Plus size={16} />
          Nova empresa
        </Link>
      </div>

      <div className="mt-6 max-w-sm">
        <SearchInput
          placeholder="Buscar por nome ou CNPJ"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          aria-label="Buscar empresas"
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
            <Label htmlFor="filtro-status-empresa">Status</Label>
            <Select
              id="filtro-status-empresa"
              value={draftStatusFilter}
              onChange={(event) => setDraftStatusFilter(event.target.value as StatusFilter)}
            >
              <option value="">Todos</option>
              <option value="ativa">Ativa</option>
              <option value="inativa">Inativa</option>
            </Select>
          </div>
        </AdvancedFilterPanel>
      </div>

      <Card className="mt-6 p-6">
        {successMessage && <SuccessMessage className="mb-5">{successMessage}</SuccessMessage>}

        {isLoading && <Loading label="Carregando empresas…" />}

        {isError && <ErrorMessage>{getErrorMessage(error, "Não foi possível carregar as empresas.")}</ErrorMessage>}

        {!isLoading && !isError && filteredEmpresas.length === 0 && (
          <p className="py-10 text-center text-sm text-ink-500">Nenhuma empresa encontrada.</p>
        )}

        {!isLoading && !isError && filteredEmpresas.length > 0 && (
          <>
            <EmpresasTable
              empresas={paginatedEmpresas}
              onDelete={handleDelete}
              isDeleting={(id) => deletingId === id}
            />
            <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
          </>
        )}
      </Card>
    </AppLayout>
  );
}
