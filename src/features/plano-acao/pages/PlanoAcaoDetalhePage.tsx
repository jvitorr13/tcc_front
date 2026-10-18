import { ArrowLeft, ChevronDown, NotebookPen, Pencil, Plus, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";

import { getErrorMessage } from "@/lib/get-error-message";

import { ErrorMessage } from "@/components/feedback/ErrorMessage";
import { Loading } from "@/components/feedback/Loading";
import { SuccessMessage } from "@/components/feedback/SuccessMessage";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Modal } from "@/components/ui/Modal";
import { AppLayout } from "@/layouts/AppLayout";
import { useAuth } from "@/hooks/useAuth";
import { ROUTES, diagnosticoDetalhePath } from "@/constants/routes";
import { formatDate } from "@/utils/format";

import { ApontamentosPanel } from "@/features/apontamentos";
import { useDiagnosticosQuery } from "@/features/diagnosticos";
import { useEmpresaQuery } from "@/features/empresas";
import { useUsersQuery } from "@/features/users";

import { CreateTarefaForm, type ResponsavelOption } from "@/features/plano-acao/components/CreateTarefaForm";
import { EditPlanoAcaoForm } from "@/features/plano-acao/components/EditPlanoAcaoForm";
import { TarefaCard } from "@/features/plano-acao/components/TarefaCard";
import { useCreateTarefaMutation } from "@/features/plano-acao/hooks/useCreateTarefaMutation";
import { useDeletePlanoAcaoMutation } from "@/features/plano-acao/hooks/useDeletePlanoAcaoMutation";
import { useDeleteTarefaMutation } from "@/features/plano-acao/hooks/useDeleteTarefaMutation";
import { usePlanoAcaoQuery } from "@/features/plano-acao/hooks/usePlanoAcaoQuery";
import { useUpdatePlanoAcaoMutation } from "@/features/plano-acao/hooks/useUpdatePlanoAcaoMutation";
import { useUpdateTarefaMutation } from "@/features/plano-acao/hooks/useUpdateTarefaMutation";
import type { CreateTarefaFormData } from "@/features/plano-acao/schemas/create-tarefa.schema";
import type { UpdatePlanoAcaoFormData } from "@/features/plano-acao/schemas/update-plano-acao.schema";
import type { PlanoAcaoStatus, UpdateTarefaInput } from "@/features/plano-acao/types/plano-acao.types";

const STATUS_LABELS: Record<PlanoAcaoStatus, string> = {
  PENDENTE: "Pendente",
  EM_ANDAMENTO: "Em andamento",
  CONCLUIDO: "Concluído",
};

const STATUS_VARIANTS: Record<PlanoAcaoStatus, "neutral" | "gold" | "success"> = {
  PENDENTE: "neutral",
  EM_ANDAMENTO: "gold",
  CONCLUIDO: "success",
};

interface PlanoAcaoDetalheLocationState {
  successMessage?: string;
}

/**
 * Detalhe de um plano de ação: dados do plano (sem campo de status editável
 * — vem sempre do back-end, derivado das tarefas) + a lista de tarefas, com
 * criação, edição (status/observação) e exclusão inline.
 */
export function PlanoAcaoDetalhePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();

  const { data: plano, isLoading, isError, error } = usePlanoAcaoQuery(id);
  // GET /empresas/{id} vale pros dois perfis (EMPRESA só a própria). Antes
  // usava GET /empresas, que é só CONSULTOR — por isso a EMPRESA via "—".
  const { data: empresa } = useEmpresaQuery(plano?.empresa_id);
  const { data: diagnosticos } = useDiagnosticosQuery(plano ? [plano.empresa_id] : []);

  // Responsável da tarefa = uma pessoa vinculada à empresa do plano. Não há
  // filtro por empresa em GET /users, então busca os usuários EMPRESA ativos
  // e filtra por empresa_id aqui. GET /users é só CONSULTOR: para a EMPRESA,
  // a única pessoa que o front conhece da própria empresa é ela mesma.
  const { user } = useAuth();
  const isConsultor = user?.tipo_usuario === "CONSULTOR";
  const { data: usuariosEmpresa, isLoading: isLoadingUsuarios } = useUsersQuery(
    { tipo_usuario: "EMPRESA", ativo: true },
    { enabled: isConsultor },
  );
  const responsaveis = useMemo<ResponsavelOption[]>(() => {
    if (!plano) return [];
    if (!isConsultor) return user ? [{ id: user.id, nome: user.nome, email: user.email }] : [];
    return (usuariosEmpresa ?? [])
      .filter((pessoa) => pessoa.empresa_id === plano.empresa_id)
      .map((pessoa) => ({ id: pessoa.id, nome: pessoa.nome, email: pessoa.email }))
      .sort((a, b) => a.nome.localeCompare(b.nome, "pt-BR"));
  }, [plano, isConsultor, user, usuariosEmpresa]);
  const nomeResponsavelPorId = useMemo(
    () => new Map(responsaveis.map((pessoa) => [pessoa.id, pessoa.nome])),
    [responsaveis],
  );
  const diagnostico = useMemo(
    () => (diagnosticos ?? []).find((item) => item.id === plano?.diagnostico_id),
    [diagnosticos, plano],
  );

  const deletePlanoMutation = useDeletePlanoAcaoMutation();
  const updatePlanoMutation = useUpdatePlanoAcaoMutation(id ?? "");
  const createTarefaMutation = useCreateTarefaMutation(id ?? "");
  const updateTarefaMutation = useUpdateTarefaMutation(id ?? "");
  const deleteTarefaMutation = useDeleteTarefaMutation(id ?? "");

  const [confirmingDeletePlano, setConfirmingDeletePlano] = useState(false);
  const [deletePlanoError, setDeletePlanoError] = useState<string | null>(null);
  const [isEditingPlano, setIsEditingPlano] = useState(false);
  const [editPlanoError, setEditPlanoError] = useState<string | null>(null);
  const [isAddingTarefa, setIsAddingTarefa] = useState(false);
  const [createTarefaError, setCreateTarefaError] = useState<string | null>(null);
  const [updatingTarefaId, setUpdatingTarefaId] = useState<string | null>(null);
  const [deletingTarefaId, setDeletingTarefaId] = useState<string | null>(null);
  const [tarefaActionError, setTarefaActionError] = useState<string | null>(null);
  // Tarefa com a seção "Apontamentos" aberta (uma por vez; só CONSULTOR).
  const [apontamentosTarefaId, setApontamentosTarefaId] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(
    () => (location.state as PlanoAcaoDetalheLocationState | null)?.successMessage ?? null,
  );

  async function handleDeletePlano() {
    if (!id) return;
    setDeletePlanoError(null);
    try {
      await deletePlanoMutation.mutateAsync(id);
      navigate(ROUTES.planosAcao, { replace: true, state: { successMessage: "Plano de ação excluído com sucesso." } });
    } catch (err) {
      setDeletePlanoError(getErrorMessage(err, "Não foi possível excluir o plano de ação."));
      setConfirmingDeletePlano(false);
    }
  }

  async function handleUpdatePlano(data: UpdatePlanoAcaoFormData) {
    setEditPlanoError(null);
    setActionSuccess(null);
    try {
      await updatePlanoMutation.mutateAsync({ titulo: data.titulo, descricao: data.descricao || undefined });
      setIsEditingPlano(false);
      setActionSuccess("Plano atualizado com sucesso.");
    } catch (err) {
      setEditPlanoError(getErrorMessage(err, "Não foi possível atualizar o plano de ação."));
    }
  }

  async function handleCreateTarefa(data: CreateTarefaFormData) {
    setCreateTarefaError(null);
    setActionSuccess(null);
    try {
      await createTarefaMutation.mutateAsync({
        titulo: data.titulo,
        descricao: data.descricao || undefined,
        responsavel_id: data.responsavel_id,
        prazo: data.prazo || undefined,
        prioridade: data.prioridade,
      });
      setIsAddingTarefa(false);
      setActionSuccess("Tarefa criada com sucesso.");
    } catch (err) {
      setCreateTarefaError(getErrorMessage(err, "Não foi possível criar a tarefa."));
    }
  }

  async function handleUpdateTarefa(tarefaId: string, input: UpdateTarefaInput) {
    setTarefaActionError(null);
    setActionSuccess(null);
    setUpdatingTarefaId(tarefaId);
    try {
      await updateTarefaMutation.mutateAsync({ tarefaId, input });
      setActionSuccess("Tarefa atualizada com sucesso.");
    } catch (err) {
      const message = getErrorMessage(err, "Não foi possível atualizar a tarefa.");
      setTarefaActionError(message);
      throw new Error(message);
    } finally {
      setUpdatingTarefaId(null);
    }
  }

  async function handleDeleteTarefa(tarefaId: string) {
    setTarefaActionError(null);
    setActionSuccess(null);
    setDeletingTarefaId(tarefaId);
    try {
      await deleteTarefaMutation.mutateAsync(tarefaId);
      setActionSuccess("Tarefa excluída com sucesso.");
    } catch (err) {
      setTarefaActionError(getErrorMessage(err, "Não foi possível excluir a tarefa."));
    } finally {
      setDeletingTarefaId(null);
    }
  }

  if (isLoading) {
    return (
      <AppLayout>
        <Loading label="Carregando plano de ação…" />
      </AppLayout>
    );
  }

  if (isError || !plano) {
    return (
      <AppLayout>
        <ErrorMessage>{getErrorMessage(error, "Não foi possível carregar o plano de ação.")}</ErrorMessage>
        <Link to={ROUTES.planosAcao} className="mt-4 inline-block text-sm font-medium text-ink-700 hover:text-ink-900">
          Voltar para Planos de Ação
        </Link>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <Link
        to={ROUTES.planosAcao}
        className="inline-flex items-center gap-1.5 text-sm font-medium text-ink-600 transition-colors hover:text-ink-900"
      >
        <ArrowLeft size={15} />
        Voltar para Planos de Ação
      </Link>

      <div className="mt-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl text-ink-900">{plano.titulo}</h1>
          <p className="mt-1 text-sm text-ink-600">
            {empresa ? empresa.nome_fantasia || empresa.razao_social : "—"}
            {diagnostico && (
              <>
                {" • Diagnóstico "}
                <Link
                  to={diagnosticoDetalhePath(diagnostico.id, plano.empresa_id)}
                  className="font-medium text-ink-700 underline decoration-ink-900/20 underline-offset-2 hover:text-ink-900"
                >
                  {diagnostico.nome}
                </Link>
              </>
            )}
          </p>
          <p className="mt-1 text-sm text-ink-600">Criado em: {formatDate(plano.created_at)}</p>
        </div>

        <div className="flex items-center gap-3">
          <Badge variant={STATUS_VARIANTS[plano.status]}>{STATUS_LABELS[plano.status]}</Badge>
          {!isEditingPlano && !confirmingDeletePlano && (
            <>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => {
                  setEditPlanoError(null);
                  setIsEditingPlano(true);
                }}
              >
                <Pencil size={14} />
                Editar plano
              </Button>
              <Button type="button" variant="ghost" size="sm" onClick={() => setConfirmingDeletePlano(true)}>
                <Trash2 size={14} />
                Excluir plano
              </Button>
            </>
          )}
        </div>
      </div>

      {actionSuccess && <SuccessMessage className="mt-3">{actionSuccess}</SuccessMessage>}
      {deletePlanoError && <ErrorMessage className="mt-3">{deletePlanoError}</ErrorMessage>}

      {isEditingPlano && (
        <Card className="mt-4 p-4">
          <EditPlanoAcaoForm
            defaultValues={{ titulo: plano.titulo, descricao: plano.descricao }}
            onSubmit={handleUpdatePlano}
            onCancel={() => {
              setIsEditingPlano(false);
              setEditPlanoError(null);
            }}
            isSubmitting={updatePlanoMutation.isPending}
            submitError={editPlanoError}
          />
        </Card>
      )}

      {confirmingDeletePlano && (
        <Card className="mt-4 p-4">
          <p className="text-sm text-ink-700">
            Excluir este plano de ação? Todas as suas tarefas também serão removidas. Essa ação não pode ser desfeita.
          </p>
          <div className="mt-3 flex gap-3">
            <Button type="button" variant="secondary" size="sm" onClick={() => setConfirmingDeletePlano(false)}>
              Cancelar
            </Button>
            <Button
              type="button"
              variant="danger"
              size="sm"
              onClick={handleDeletePlano}
              isLoading={deletePlanoMutation.isPending}
            >
              Confirmar exclusão
            </Button>
          </div>
        </Card>
      )}

      {plano.descricao && (
        <Card className="mt-6 p-6">
          <h2 className="font-display text-lg text-ink-900">Descrição</h2>
          <p className="mt-2 text-sm text-ink-700">{plano.descricao}</p>
        </Card>
      )}

      <Card className="mt-6 p-6">
        <div className="flex items-center justify-between gap-3">
          <h2 className="font-display text-lg text-ink-900">Tarefas</h2>
          <Button type="button" size="sm" onClick={() => setIsAddingTarefa(true)}>
            <Plus size={15} />
            Nova Tarefa
          </Button>
        </div>

        <Modal
          open={isAddingTarefa}
          onClose={() => {
            setIsAddingTarefa(false);
            setCreateTarefaError(null);
          }}
          title="Nova Tarefa"
        >
          <CreateTarefaForm
            responsaveis={responsaveis}
            isLoadingResponsaveis={isConsultor && isLoadingUsuarios}
            onSubmit={handleCreateTarefa}
            onCancel={() => {
              setIsAddingTarefa(false);
              setCreateTarefaError(null);
            }}
            isSubmitting={createTarefaMutation.isPending}
            submitError={createTarefaError}
          />
        </Modal>

        {tarefaActionError && <ErrorMessage className="mt-4">{tarefaActionError}</ErrorMessage>}

        {plano.tarefas.length === 0 ? (
          <p className="mt-4 py-6 text-center text-sm text-ink-500">Nenhuma tarefa cadastrada ainda.</p>
        ) : (
          <div className="mt-4 space-y-3">
            {plano.tarefas.map((tarefa) => {
              const apontamentosAbertos = apontamentosTarefaId === tarefa.id;
              return (
                <div key={tarefa.id}>
                  <TarefaCard
                    tarefa={tarefa}
                    responsavelNome={
                      tarefa.responsavel_id ? nomeResponsavelPorId.get(tarefa.responsavel_id) : undefined
                    }
                    onUpdate={(input) => handleUpdateTarefa(tarefa.id, input)}
                    isUpdating={updatingTarefaId === tarefa.id}
                    onDelete={() => handleDeleteTarefa(tarefa.id)}
                    isDeleting={deletingTarefaId === tarefa.id}
                  />
                  {isConsultor && (
                    <>
                      <button
                        type="button"
                        onClick={() => setApontamentosTarefaId(apontamentosAbertos ? null : tarefa.id)}
                        aria-expanded={apontamentosAbertos}
                        className="mt-1.5 inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium text-ink-600 transition-colors hover:bg-ink-900/5 hover:text-ink-900"
                      >
                        <NotebookPen size={13} />
                        Apontamentos
                        <ChevronDown
                          size={13}
                          className={apontamentosAbertos ? "rotate-180 transition-transform" : "transition-transform"}
                        />
                      </button>
                      {apontamentosAbertos && (
                        <div className="mt-2">
                          <ApontamentosPanel
                            empresaId={plano.empresa_id}
                            title="Apontamentos da tarefa"
                            canManage
                            filtro={{ tarefa_id: tarefa.id }}
                            vinculoFixo={{ tipo: "TAREFA", id: tarefa.id, label: `Tarefa: ${tarefa.titulo}` }}
                            createLabel="Adicionar apontamento"
                            emptyMessage="Nenhum apontamento sobre esta tarefa ainda."
                            pageSize={5}
                          />
                        </div>
                      )}
                    </>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </Card>
    </AppLayout>
  );
}
