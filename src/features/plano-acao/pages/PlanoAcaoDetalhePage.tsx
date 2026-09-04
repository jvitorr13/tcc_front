import { Plus, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

import { getErrorMessage } from "@/lib/get-error-message";

import { ErrorMessage } from "@/components/feedback/ErrorMessage";
import { Loading } from "@/components/feedback/Loading";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { AppLayout } from "@/layouts/AppLayout";
import { ROUTES } from "@/constants/routes";
import { formatDate } from "@/utils/format";

import { useDiagnosticosQuery } from "@/features/diagnosticos";
import { useEmpresasQuery } from "@/features/empresas";

import { CreateTarefaForm } from "@/features/plano-acao/components/CreateTarefaForm";
import { TarefaCard } from "@/features/plano-acao/components/TarefaCard";
import { useCreateTarefaMutation } from "@/features/plano-acao/hooks/useCreateTarefaMutation";
import { useDeletePlanoAcaoMutation } from "@/features/plano-acao/hooks/useDeletePlanoAcaoMutation";
import { useDeleteTarefaMutation } from "@/features/plano-acao/hooks/useDeleteTarefaMutation";
import { usePlanoAcaoQuery } from "@/features/plano-acao/hooks/usePlanoAcaoQuery";
import { useUpdateTarefaMutation } from "@/features/plano-acao/hooks/useUpdateTarefaMutation";
import type { CreateTarefaFormData } from "@/features/plano-acao/schemas/create-tarefa.schema";
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

/**
 * Detalhe de um plano de ação: dados do plano (sem campo de status editável
 * — vem sempre do back-end, derivado das tarefas) + a lista de tarefas, com
 * criação, edição (status/observação) e exclusão inline.
 */
export function PlanoAcaoDetalhePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: plano, isLoading, isError, error } = usePlanoAcaoQuery(id);
  const { data: empresas } = useEmpresasQuery();
  const { data: diagnosticos } = useDiagnosticosQuery(plano ? [plano.empresa_id] : []);

  const empresa = useMemo(
    () => (empresas ?? []).find((item) => item.id === plano?.empresa_id),
    [empresas, plano],
  );
  const diagnostico = useMemo(
    () => (diagnosticos ?? []).find((item) => item.id === plano?.diagnostico_id),
    [diagnosticos, plano],
  );

  const deletePlanoMutation = useDeletePlanoAcaoMutation();
  const createTarefaMutation = useCreateTarefaMutation(id ?? "");
  const updateTarefaMutation = useUpdateTarefaMutation(id ?? "");
  const deleteTarefaMutation = useDeleteTarefaMutation(id ?? "");

  const [confirmingDeletePlano, setConfirmingDeletePlano] = useState(false);
  const [deletePlanoError, setDeletePlanoError] = useState<string | null>(null);
  const [isAddingTarefa, setIsAddingTarefa] = useState(false);
  const [createTarefaError, setCreateTarefaError] = useState<string | null>(null);
  const [updatingTarefaId, setUpdatingTarefaId] = useState<string | null>(null);
  const [deletingTarefaId, setDeletingTarefaId] = useState<string | null>(null);
  const [tarefaActionError, setTarefaActionError] = useState<string | null>(null);

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

  async function handleCreateTarefa(data: CreateTarefaFormData) {
    setCreateTarefaError(null);
    try {
      await createTarefaMutation.mutateAsync({
        titulo: data.titulo,
        descricao: data.descricao || undefined,
        responsavel: data.responsavel,
        prazo: data.prazo || undefined,
        prioridade: data.prioridade,
      });
      setIsAddingTarefa(false);
    } catch (err) {
      setCreateTarefaError(getErrorMessage(err, "Não foi possível criar a tarefa."));
    }
  }

  async function handleUpdateTarefa(tarefaId: string, input: UpdateTarefaInput) {
    setTarefaActionError(null);
    setUpdatingTarefaId(tarefaId);
    try {
      await updateTarefaMutation.mutateAsync({ tarefaId, input });
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
    setDeletingTarefaId(tarefaId);
    try {
      await deleteTarefaMutation.mutateAsync(tarefaId);
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
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl text-ink-900">{plano.titulo}</h1>
          <p className="mt-1 text-sm text-ink-600">
            {empresa ? empresa.nome_fantasia || empresa.razao_social : "—"}
            {diagnostico ? ` • Diagnóstico ${diagnostico.nome}` : ""}
          </p>
          <p className="mt-1 text-sm text-ink-600">Criado em: {formatDate(plano.created_at)}</p>
        </div>

        <div className="flex items-center gap-3">
          <Badge variant={STATUS_VARIANTS[plano.status]}>{STATUS_LABELS[plano.status]}</Badge>
          {!confirmingDeletePlano && (
            <Button type="button" variant="ghost" size="sm" onClick={() => setConfirmingDeletePlano(true)}>
              <Trash2 size={14} />
              Excluir plano
            </Button>
          )}
        </div>
      </div>

      {deletePlanoError && <ErrorMessage className="mt-3">{deletePlanoError}</ErrorMessage>}

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
          {!isAddingTarefa && (
            <Button type="button" size="sm" onClick={() => setIsAddingTarefa(true)}>
              <Plus size={15} />
              Nova Tarefa
            </Button>
          )}
        </div>

        {isAddingTarefa && (
          <div className="mt-4">
            <CreateTarefaForm
              onSubmit={handleCreateTarefa}
              onCancel={() => {
                setIsAddingTarefa(false);
                setCreateTarefaError(null);
              }}
              isSubmitting={createTarefaMutation.isPending}
              submitError={createTarefaError}
            />
          </div>
        )}

        {tarefaActionError && <ErrorMessage className="mt-4">{tarefaActionError}</ErrorMessage>}

        {plano.tarefas.length === 0 ? (
          <p className="mt-4 py-6 text-center text-sm text-ink-500">Nenhuma tarefa cadastrada ainda.</p>
        ) : (
          <div className="mt-4 space-y-3">
            {plano.tarefas.map((tarefa) => (
              <TarefaCard
                key={tarefa.id}
                tarefa={tarefa}
                onUpdate={(input) => handleUpdateTarefa(tarefa.id, input)}
                isUpdating={updatingTarefaId === tarefa.id}
                onDelete={() => handleDeleteTarefa(tarefa.id)}
                isDeleting={deletingTarefaId === tarefa.id}
              />
            ))}
          </div>
        )}
      </Card>
    </AppLayout>
  );
}
