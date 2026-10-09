import { Plus, Settings2 } from "lucide-react";
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
import { useAuth } from "@/hooks/useAuth";
import { ROUTES } from "@/constants/routes";

import { useEmpresasQuery } from "@/features/empresas";
import { useModelosQuery } from "@/features/questionario";

import { DiagnosticoAbertoCard } from "@/features/diagnosticos/components/DiagnosticoAbertoCard";
import { DiagnosticoConcluidoItem } from "@/features/diagnosticos/components/DiagnosticoConcluidoItem";
import { DiagnosticosTable } from "@/features/diagnosticos/components/DiagnosticosTable";
import { useDiagnosticosQuery } from "@/features/diagnosticos/hooks/useDiagnosticosQuery";
import type { DiagnosticoStatus } from "@/features/diagnosticos/types/diagnostico.types";

type StatusFilter = "" | DiagnosticoStatus;

interface DiagnosticosListLocationState {
  successMessage?: string;
}

/**
 * Mesma rota (/diagnosticos) pros dois perfis — este componente decide o
 * que renderizar com base em tipo_usuario, não existe uma segunda rota nem
 * uma segunda tela pra EMPRESA:
 *
 *  - CONSULTOR: listagem de verdade — busca, filtro por empresa/status,
 *    paginação, botão "Novo diagnóstico". Pode ver várias empresas.
 *  - EMPRESA: sem filtro nem botão de criar — empresa_id vem sempre de
 *    user.empresa_id (nunca escolhido). Mostra o diagnóstico em aberto
 *    (PENDENTE/EM_ANDAMENTO — no máximo um) com o progresso e "Continuar
 *    respondendo", e abaixo o histórico de concluídos com média e nível
 *    de maturidade. Os dois levam pra DiagnosticoDetalhePage, a mesma tela
 *    de detalhe que o CONSULTOR usa.
 */
export function DiagnosticosListPage() {
  const { user } = useAuth();
  const isEmpresa = user?.tipo_usuario === "EMPRESA";

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

  // GET /empresas e /questionario/* são só CONSULTOR — a EMPRESA levaria 403.
  const { data: empresas, isLoading: isLoadingEmpresas } = useEmpresasQuery({ enabled: !isEmpresa });
  const { data: modelos } = useModelosQuery({ enabled: !isEmpresa });

  // EMPRESA nunca escolhe empresa — é sempre a própria, do token. CONSULTOR
  // sem filtro busca uma vez por empresa e junta tudo (não existe "listar
  // diagnósticos de todas as empresas" no back-end — GET /diagnosticos
  // exige empresa_id).
  const empresaIds = useMemo(() => {
    if (isEmpresa) return user?.empresa_id ? [user.empresa_id] : [];
    if (empresaFilter) return [empresaFilter];
    return (empresas ?? []).map((empresa) => empresa.id);
  }, [isEmpresa, user?.empresa_id, empresaFilter, empresas]);

  const {
    data: diagnosticos,
    isLoading: isLoadingDiagnosticos,
    isError,
    error,
  } = useDiagnosticosQuery(empresaIds, isEmpresa ? undefined : statusFilter || undefined);
  const isLoading = isLoadingEmpresas || isLoadingDiagnosticos;

  // Só usados no caminho EMPRESA: o diagnóstico em aberto (a empresa tem no
  // máximo um — RASCUNHO nem chega pra ela) e os concluídos, do mais
  // recente pro mais antigo.
  const diagnosticoAberto = useMemo(
    () => diagnosticos?.find((item) => item.status === "PENDENTE" || item.status === "EM_ANDAMENTO"),
    [diagnosticos],
  );
  const diagnosticosConcluidos = useMemo(
    () =>
      (diagnosticos ?? [])
        .filter((item) => item.status === "CONCLUIDO")
        .sort(
          (a, b) =>
            new Date(b.data_conclusao ?? b.updated_at).getTime() - new Date(a.data_conclusao ?? a.updated_at).getTime(),
        ),
    [diagnosticos],
  );

  const empresaNameById = useMemo(() => {
    const map = new Map<string, string>();
    for (const empresa of empresas ?? []) map.set(empresa.id, empresa.nome_fantasia || empresa.razao_social);
    return map;
  }, [empresas]);

  const modeloNameById = useMemo(() => {
    const map = new Map<string, string>();
    // Chave = id da VERSÃO (o diagnóstico guarda modelo_versao_id).
    for (const modelo of modelos ?? []) {
      for (const versao of modelo.versoes) map.set(versao.id, `${modelo.nome} — v${versao.numero_versao}`);
    }
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

  if (isEmpresa) {
    if (isLoading) {
      return (
        <AppLayout>
          <Loading label="Carregando diagnóstico…" />
        </AppLayout>
      );
    }

    if (isError) {
      return (
        <AppLayout>
          <ErrorMessage>{getErrorMessage(error, "Não foi possível carregar o diagnóstico.")}</ErrorMessage>
        </AppLayout>
      );
    }

    if (!user?.empresa_id) {
      return (
        <AppLayout>
          <ErrorMessage>Não foi possível identificar a empresa deste usuário.</ErrorMessage>
        </AppLayout>
      );
    }

    const semNenhum = !diagnosticoAberto && diagnosticosConcluidos.length === 0;

    return (
      <AppLayout>
        <h1 className="font-display text-2xl text-ink-900">Diagnósticos</h1>
        <p className="mt-1 text-sm text-ink-600">Os diagnósticos da sua empresa, feitos com o seu consultor.</p>

        {semNenhum && (
          <Card className="mt-6 flex flex-col items-center gap-2 px-6 py-16 text-center">
            <p className="text-sm font-medium text-ink-900">Nenhum diagnóstico atribuído ainda.</p>
            <p className="max-w-sm text-sm text-ink-500">
              Assim que um consultor liberar um diagnóstico para sua empresa, ele aparece aqui.
            </p>
          </Card>
        )}

        {diagnosticoAberto && (
          <div className="mt-6">
            <DiagnosticoAbertoCard diagnostico={diagnosticoAberto} />
          </div>
        )}

        {diagnosticosConcluidos.length > 0 && (
          <section className="mt-8">
            <h2 className="font-display text-lg text-ink-900">Concluídos</h2>
            <Card className="mt-3 px-6 py-2">
              <ul className="divide-y divide-ink-900/6">
                {diagnosticosConcluidos.map((diagnostico) => (
                  <DiagnosticoConcluidoItem key={diagnostico.id} diagnostico={diagnostico} />
                ))}
              </ul>
            </Card>
          </section>
        )}
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-2xl text-ink-900">Diagnósticos</h1>
        <div className="flex items-center gap-3">
          <Link
            to={ROUTES.questionarioModelos}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-ink-900/10 bg-canvas px-4 text-sm font-medium text-ink-900 transition-colors hover:bg-ink-900/5"
          >
            <Settings2 size={16} />
            Modelos de diagnóstico
          </Link>
          <Link
            to={ROUTES.diagnosticosNovo}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-ink-900 px-4 text-sm font-medium text-white transition-colors hover:bg-ink-800"
          >
            <Plus size={16} />
            Novo diagnóstico
          </Link>
        </div>
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
              <option value="PENDENTE">Aguardando respostas</option>
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
