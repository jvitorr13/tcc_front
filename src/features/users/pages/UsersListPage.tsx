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

import type { AuthUser, TipoUsuario } from "@/features/auth";
import { useEmpresasQuery } from "@/features/empresas";
import { TIPO_USUARIO_OPTIONS } from "@/features/users/constants";
import { UsersTable } from "@/features/users/components/UsersTable";
import { useDeleteUserMutation } from "@/features/users/hooks/useDeleteUserMutation";
import { useUsersQuery } from "@/features/users/hooks/useUsersQuery";

type StatusFilter = "" | "ativo" | "inativo";

interface UsersListLocationState {
  successMessage?: string;
}

/**
 * Tela de Usuários: lista + filtros por tipo/status + ações de editar e
 * excluir. Cadastro/edição vivem em telas próprias (CreateUserPage,
 * EditUserPage) — esta página só lista e reage às mutations delas via
 * invalidação de query (ver useCreateUserMutation/useUpdateUserMutation).
 */
export function UsersListPage() {
  const location = useLocation();
  const [successMessage] = useState(
    () => (location.state as UsersListLocationState | null)?.successMessage ?? null,
  );

  const [search, setSearch] = useState("");

  // Filtros aplicados (dirigem a query/lista) e o "rascunho" editado dentro
  // do AdvancedFilterPanel — só viram filtro de verdade em "Aplicar
  // filtros" (ver handleApplyFilters/handleClearFilters/handleOpenFilters).
  const [tipoFilter, setTipoFilter] = useState<TipoUsuario | "">("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("");
  const [draftTipoFilter, setDraftTipoFilter] = useState<TipoUsuario | "">("");
  const [draftStatusFilter, setDraftStatusFilter] = useState<StatusFilter>("");

  function handleOpenFilters() {
    setDraftTipoFilter(tipoFilter);
    setDraftStatusFilter(statusFilter);
  }

  function handleApplyFilters() {
    setTipoFilter(draftTipoFilter);
    setStatusFilter(draftStatusFilter);
  }

  function handleClearFilters() {
    setDraftTipoFilter("");
    setDraftStatusFilter("");
    setTipoFilter("");
    setStatusFilter("");
  }

  const {
    data: users,
    isLoading,
    isError,
    error,
  } = useUsersQuery({
    tipo_usuario: tipoFilter || undefined,
    ativo: statusFilter === "" ? undefined : statusFilter === "ativo",
  });

  const filteredUsers = useMemo(() => {
    if (!users) return [];
    const term = search.trim().toLowerCase();
    if (!term) return users;
    return users.filter((user) => user.nome.toLowerCase().includes(term) || user.email.toLowerCase().includes(term));
  }, [users, search]);

  const activeFilterCount = (tipoFilter ? 1 : 0) + (statusFilter ? 1 : 0);
  const { page, setPage, totalPages, paginatedItems: paginatedUsers } = usePagination(filteredUsers);

  const { data: empresas } = useEmpresasQuery();
  const empresaNameById = useMemo(() => {
    const map = new Map<string, string>();
    for (const empresa of empresas ?? []) {
      map.set(empresa.id, empresa.nome_fantasia || empresa.razao_social);
    }
    return map;
  }, [empresas]);

  const deleteMutation = useDeleteUserMutation();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function handleDelete(user: AuthUser) {
    setDeletingId(user.id);
    try {
      await deleteMutation.mutateAsync(user.id);
    } catch {
      // erro de exclusão fica silencioso por ora — sem um lugar dedicado
      // pra mostrar erro de ação em linha, o registro simplesmente continua
      // na lista, o que já sinaliza pro usuário que a exclusão não colou.
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <AppLayout>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-2xl text-ink-900">Usuários</h1>
        <Link
          to={ROUTES.usuariosNovo}
          className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-ink-900 px-4 text-sm font-medium text-white transition-colors hover:bg-ink-800"
        >
          <Plus size={16} />
          Novo usuário
        </Link>
      </div>

      <div className="mt-6 max-w-sm">
        <SearchInput
          placeholder="Buscar por nome ou e-mail"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          aria-label="Buscar usuários"
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
            <Label htmlFor="filtro-tipo">Tipo de usuário</Label>
            <Select
              id="filtro-tipo"
              value={draftTipoFilter}
              onChange={(event) => setDraftTipoFilter(event.target.value as TipoUsuario | "")}
            >
              <option value="">Todos</option>
              {TIPO_USUARIO_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Select>
          </div>

          <div className="w-full sm:w-56">
            <Label htmlFor="filtro-status">Status</Label>
            <Select
              id="filtro-status"
              value={draftStatusFilter}
              onChange={(event) => setDraftStatusFilter(event.target.value as StatusFilter)}
            >
              <option value="">Todos</option>
              <option value="ativo">Ativo</option>
              <option value="inativo">Inativo</option>
            </Select>
          </div>
        </AdvancedFilterPanel>
      </div>

      <Card className="mt-6 p-6">
        {successMessage && <SuccessMessage className="mb-5">{successMessage}</SuccessMessage>}

        {isLoading && <Loading label="Carregando usuários…" />}

        {isError && <ErrorMessage>{getErrorMessage(error, "Não foi possível carregar os usuários.")}</ErrorMessage>}

        {!isLoading && !isError && filteredUsers.length === 0 && (
          <p className="py-10 text-center text-sm text-ink-500">Nenhum usuário encontrado.</p>
        )}

        {!isLoading && !isError && filteredUsers.length > 0 && (
          <>
            <UsersTable
              users={paginatedUsers}
              empresaNameById={empresaNameById}
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
