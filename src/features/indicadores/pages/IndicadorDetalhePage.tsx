import { AlertTriangle, ArrowLeft, Pencil, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
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
import { ROUTES } from "@/constants/routes";
import { formatDate, formatDecimal } from "@/utils/format";

import { useEmpresaQuery } from "@/features/empresas";

import { EditIndicadorForm } from "@/features/indicadores/components/EditIndicadorForm";
import { IndicadorEvolutionChart } from "@/features/indicadores/components/IndicadorEvolutionChart";
import { IndicadorValoresTable } from "@/features/indicadores/components/IndicadorValoresTable";
import { RegistrarMedicaoForm } from "@/features/indicadores/components/RegistrarMedicaoForm";
import { PERIODICIDADE_LABELS, SITUACAO_LABELS, SITUACAO_VARIANTS } from "@/features/indicadores/constants/labels";
import { useCreateValorMutation } from "@/features/indicadores/hooks/useCreateValorMutation";
import { useDeleteIndicadorMutation } from "@/features/indicadores/hooks/useDeleteIndicadorMutation";
import { useIndicadorQuery } from "@/features/indicadores/hooks/useIndicadorQuery";
import { useIndicadorValoresQuery } from "@/features/indicadores/hooks/useIndicadorValoresQuery";
import { useUpdateIndicadorMutation } from "@/features/indicadores/hooks/useUpdateIndicadorMutation";
import type { CreateValorFormData } from "@/features/indicadores/schemas/create-valor.schema";
import type { UpdateIndicadorFormData } from "@/features/indicadores/schemas/update-indicador.schema";

interface IndicadorDetalheLocationState {
  successMessage?: string;
}

/**
 * Detalhe de um indicador: informações + valor atual/meta/situação (só
 * exibidos, nunca calculados aqui) + gráfico de evolução + histórico +
 * registrar nova medição. `situacao`/`valor_atual` sempre vêm do back-end
 * (GET /indicadores/:id); o histórico vem de GET /indicadores/:id/valores.
 *
 * Editar, excluir e registrar medição: só CONSULTOR. EMPRESA só consulta.
 */
export function IndicadorDetalhePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();

  const { data: indicador, isLoading, isError, error } = useIndicadorQuery(id);
  const { data: valores, isLoading: isLoadingValores } = useIndicadorValoresQuery(id);
  const { user } = useAuth();
  const isConsultor = user?.tipo_usuario === "CONSULTOR";
  // GET /empresas/{id} vale pros dois perfis (GET /empresas é só CONSULTOR).
  const { data: empresa } = useEmpresaQuery(indicador?.empresa_id);

  const updateMutation = useUpdateIndicadorMutation(id ?? "");
  const deleteMutation = useDeleteIndicadorMutation();
  const createValorMutation = useCreateValorMutation(id ?? "");

  const [isEditing, setIsEditing] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [isRegistrandoMedicao, setIsRegistrandoMedicao] = useState(false);
  const [medicaoError, setMedicaoError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(
    () => (location.state as IndicadorDetalheLocationState | null)?.successMessage ?? null,
  );

  async function handleUpdate(data: UpdateIndicadorFormData) {
    setEditError(null);
    setActionSuccess(null);
    try {
      await updateMutation.mutateAsync({
        nome: data.nome,
        descricao: data.descricao || undefined,
        unidade: data.unidade,
        meta: data.meta ? Number(data.meta) : undefined,
        periodicidade: data.periodicidade,
      });
      setIsEditing(false);
      setActionSuccess("Indicador atualizado com sucesso.");
    } catch (err) {
      setEditError(getErrorMessage(err, "Não foi possível atualizar o indicador."));
    }
  }

  async function handleDelete() {
    if (!id) return;
    setDeleteError(null);
    try {
      await deleteMutation.mutateAsync(id);
      navigate(ROUTES.indicadores, { replace: true, state: { successMessage: "Indicador excluído com sucesso." } });
    } catch (err) {
      setDeleteError(getErrorMessage(err, "Não foi possível excluir o indicador."));
      setConfirmingDelete(false);
    }
  }

  async function handleRegistrarMedicao(data: CreateValorFormData) {
    setMedicaoError(null);
    setActionSuccess(null);
    try {
      await createValorMutation.mutateAsync({
        valor: Number(data.valor),
        data_referencia: data.data_referencia,
        observacao: data.observacao || undefined,
      });
      setIsRegistrandoMedicao(false);
      setActionSuccess("Medição registrada com sucesso.");
    } catch (err) {
      setMedicaoError(getErrorMessage(err, "Não foi possível registrar a medição."));
    }
  }

  if (isLoading) {
    return (
      <AppLayout>
        <Loading label="Carregando indicador…" />
      </AppLayout>
    );
  }

  if (isError || !indicador) {
    return (
      <AppLayout>
        <ErrorMessage>{getErrorMessage(error, "Não foi possível carregar o indicador.")}</ErrorMessage>
        <Link to={ROUTES.indicadores} className="mt-4 inline-block text-sm font-medium text-ink-700 hover:text-ink-900">
          Voltar para Indicadores
        </Link>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <Link
        to={ROUTES.indicadores}
        className="inline-flex items-center gap-1.5 text-sm font-medium text-ink-600 transition-colors hover:text-ink-900"
      >
        <ArrowLeft size={15} />
        Voltar para Indicadores
      </Link>

      <div className="mt-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl text-ink-900">{indicador.nome}</h1>
          <p className="mt-1 text-sm text-ink-600">{empresa ? empresa.nome_fantasia || empresa.razao_social : "—"}</p>
          <p className="mt-0.5 text-sm text-ink-600">Criado em: {formatDate(indicador.created_at)}</p>
        </div>

        <div className="flex items-center gap-3">
          <Badge variant={SITUACAO_VARIANTS[indicador.situacao]} className="gap-1">
            {indicador.situacao === "ABAIXO_DA_META" && <AlertTriangle size={11} />}
            {SITUACAO_LABELS[indicador.situacao]}
          </Badge>
          {isConsultor && !isEditing && !confirmingDelete && (
            <>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => {
                  setEditError(null);
                  setIsEditing(true);
                }}
              >
                <Pencil size={14} />
                Editar
              </Button>
              <Button type="button" variant="ghost" size="sm" onClick={() => setConfirmingDelete(true)}>
                <Trash2 size={14} />
                Excluir
              </Button>
            </>
          )}
        </div>
      </div>

      {actionSuccess && <SuccessMessage className="mt-3">{actionSuccess}</SuccessMessage>}
      {deleteError && <ErrorMessage className="mt-3">{deleteError}</ErrorMessage>}

      {isEditing && (
        <Card className="mt-4 p-4">
          <EditIndicadorForm
            defaultValues={{
              nome: indicador.nome,
              descricao: indicador.descricao,
              unidade: indicador.unidade,
              meta: indicador.meta != null ? String(indicador.meta) : "",
              periodicidade: indicador.periodicidade,
            }}
            onSubmit={handleUpdate}
            onCancel={() => {
              setIsEditing(false);
              setEditError(null);
            }}
            isSubmitting={updateMutation.isPending}
            submitError={editError}
          />
        </Card>
      )}

      {confirmingDelete && (
        <Card className="mt-4 p-4">
          <p className="text-sm text-ink-700">
            Excluir este indicador? Todo o histórico de medições também será removido. Essa ação não pode ser desfeita.
          </p>
          <div className="mt-3 flex gap-3">
            <Button type="button" variant="secondary" size="sm" onClick={() => setConfirmingDelete(false)}>
              Cancelar
            </Button>
            <Button type="button" variant="danger" size="sm" onClick={handleDelete} isLoading={deleteMutation.isPending}>
              Confirmar exclusão
            </Button>
          </div>
        </Card>
      )}

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <Card className="p-5">
          <p className="text-xs font-medium uppercase tracking-wide text-ink-500">Valor atual</p>
          <p className="mt-2 font-display text-2xl text-ink-900">
            {indicador.valor_atual != null ? `${indicador.unidade} ${formatDecimal(indicador.valor_atual)}` : "—"}
          </p>
        </Card>
        <Card className="p-5">
          <p className="text-xs font-medium uppercase tracking-wide text-ink-500">Meta</p>
          <p className="mt-2 font-display text-2xl text-ink-900">
            {indicador.meta != null ? `${indicador.unidade} ${formatDecimal(indicador.meta)}` : "—"}
          </p>
        </Card>
        <Card className="p-5">
          <p className="text-xs font-medium uppercase tracking-wide text-ink-500">Periodicidade</p>
          <p className="mt-2 font-display text-2xl text-ink-900">{PERIODICIDADE_LABELS[indicador.periodicidade]}</p>
        </Card>
      </div>

      {indicador.descricao && (
        <Card className="mt-6 p-6">
          <h2 className="font-display text-lg text-ink-900">Descrição</h2>
          <p className="mt-2 text-sm text-ink-700">{indicador.descricao}</p>
        </Card>
      )}

      <Card className="mt-6 p-6">
        <div className="flex items-center justify-between gap-3">
          <h2 className="font-display text-lg text-ink-900">Evolução</h2>
          {isConsultor && (
            <Button type="button" size="sm" onClick={() => setIsRegistrandoMedicao(true)}>
              <Plus size={15} />
              Registrar nova medição
            </Button>
          )}
        </div>

        <Modal
          open={isRegistrandoMedicao}
          onClose={() => {
            setIsRegistrandoMedicao(false);
            setMedicaoError(null);
          }}
          title="Registrar nova medição"
        >
          <RegistrarMedicaoForm
            unidade={indicador.unidade}
            onSubmit={handleRegistrarMedicao}
            onCancel={() => {
              setIsRegistrandoMedicao(false);
              setMedicaoError(null);
            }}
            isSubmitting={createValorMutation.isPending}
            submitError={medicaoError}
          />
        </Modal>

        <div className="mt-4">
          {isLoadingValores ? (
            <Loading label="Carregando histórico…" />
          ) : (
            <IndicadorEvolutionChart valores={valores ?? []} meta={indicador.meta} />
          )}
        </div>
      </Card>

      <Card className="mt-6 p-6">
        <h2 className="font-display text-lg text-ink-900">Histórico</h2>
        <div className="mt-4">
          {isLoadingValores ? (
            <Loading label="Carregando histórico…" />
          ) : (valores ?? []).length === 0 ? (
            <p className="py-6 text-center text-sm text-ink-500">Nenhuma medição registrada ainda.</p>
          ) : (
            <IndicadorValoresTable valores={valores ?? []} unidade={indicador.unidade} />
          )}
        </div>
      </Card>
    </AppLayout>
  );
}
