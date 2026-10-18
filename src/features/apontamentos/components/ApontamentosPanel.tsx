import { Plus, RotateCw } from "lucide-react";
import { type ReactNode, useEffect, useState } from "react";

import { getErrorMessage } from "@/lib/get-error-message";

import { ErrorMessage } from "@/components/feedback/ErrorMessage";
import { Loading } from "@/components/feedback/Loading";
import { SuccessMessage } from "@/components/feedback/SuccessMessage";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Modal } from "@/components/ui/Modal";
import { Pagination } from "@/components/ui/Pagination";

import { ApontamentoCard } from "@/features/apontamentos/components/ApontamentoCard";
import { ApontamentoForm } from "@/features/apontamentos/components/ApontamentoForm";
import {
  useCreateApontamentoMutation,
  useDeleteApontamentoMutation,
  useUpdateApontamentoMutation,
} from "@/features/apontamentos/hooks/useApontamentoMutations";
import { useApontamentosQuery } from "@/features/apontamentos/hooks/useApontamentosQuery";
import { useVinculosDaEmpresa } from "@/features/apontamentos/hooks/useVinculosDaEmpresa";
import type { ApontamentoFormData } from "@/features/apontamentos/schemas/apontamento.schema";
import type { Apontamento, VinculoFixo } from "@/features/apontamentos/types/apontamento.types";

export interface ApontamentosPanelProps {
  empresaId: string;
  title: string;
  description?: string;
  /** Lista só os de um diagnóstico ou de uma tarefa (filtro da API). */
  filtro?: { diagnostico_id?: string; tarefa_id?: string };
  /** CONSULTOR: criar, editar, excluir e ver o selo de visibilidade. EMPRESA: só leitura. */
  canManage: boolean;
  /** Criação a partir de uma tarefa/diagnóstico: o formulário abre com o vínculo travado. */
  vinculoFixo?: VinculoFixo;
  emptyMessage: string;
  createLabel?: string;
  pageSize?: number;
  /** Conteúdo entre o cabeçalho e a lista (ex.: o seletor de filtro da página da empresa). */
  toolbar?: ReactNode;
}

type ModalState = { mode: "create" } | { mode: "edit"; apontamento: Apontamento } | null;

/**
 * Linha do tempo de apontamentos de uma empresa, com paginação da API e os
 * estados carregando / erro (tentar de novo) / vazio. Mesmo componente nos
 * quatro lugares: página da empresa, seção do diagnóstico, seção da tarefa
 * (consultor, com ações) e "Observações do consultor" na home da empresa
 * (só leitura). Não filtra nada no front: o que a API devolve é o que a
 * pessoa pode ver.
 */
export function ApontamentosPanel({
  empresaId,
  title,
  description,
  filtro,
  canManage,
  vinculoFixo,
  emptyMessage,
  createLabel = "Novo apontamento",
  pageSize = 10,
  toolbar,
}: ApontamentosPanelProps) {
  const [page, setPage] = useState(1);
  const diagnosticoId = filtro?.diagnostico_id;
  const tarefaId = filtro?.tarefa_id;

  // Trocar o filtro volta pra página 1.
  useEffect(() => {
    setPage(1);
  }, [diagnosticoId, tarefaId]);

  const { data, isLoading, isError, error, refetch, isFetching } = useApontamentosQuery(empresaId, {
    page,
    page_size: pageSize,
    diagnostico_id: diagnosticoId,
    tarefa_id: tarefaId,
  });
  const apontamentos = data?.items ?? [];
  const totalPages = data?.meta?.total_pages ?? 1;

  // Excluir o último item de uma página deixa ela vazia: volta uma.
  useEffect(() => {
    if (data && apontamentos.length === 0 && page > 1) setPage((current) => current - 1);
  }, [data, apontamentos.length, page]);

  const vinculos = useVinculosDaEmpresa(empresaId);

  const createMutation = useCreateApontamentoMutation(empresaId);
  const updateMutation = useUpdateApontamentoMutation(empresaId);
  const deleteMutation = useDeleteApontamentoMutation(empresaId);

  const [modal, setModal] = useState<ModalState>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  function openModal(next: ModalState) {
    setFormError(null);
    setSuccess(null);
    setModal(next);
  }

  function closeModal() {
    setModal(null);
    setFormError(null);
  }

  async function handleSubmit(form: ApontamentoFormData) {
    if (!modal) return;
    setFormError(null);
    const visibilidade = form.compartilhar ? "EMPRESA" : "INTERNA";
    try {
      if (modal.mode === "create") {
        const tipo = vinculoFixo?.tipo ?? form.vinculo_tipo;
        const vinculoId = vinculoFixo?.id;
        await createMutation.mutateAsync({
          texto: form.texto,
          visibilidade,
          diagnostico_id: tipo === "DIAGNOSTICO" ? (vinculoId ?? form.diagnostico_id) : undefined,
          tarefa_id: tipo === "TAREFA" ? (vinculoId ?? form.tarefa_id) : undefined,
        });
        setPage(1);
        setSuccess("Apontamento registrado.");
      } else {
        await updateMutation.mutateAsync({ id: modal.apontamento.id, input: { texto: form.texto, visibilidade } });
        setSuccess("Apontamento atualizado.");
      }
      setModal(null);
    } catch (err) {
      setFormError(getErrorMessage(err, "Não foi possível salvar o apontamento."));
    }
  }

  async function handleDelete(apontamento: Apontamento) {
    setSuccess(null);
    setDeletingId(apontamento.id);
    try {
      await deleteMutation.mutateAsync(apontamento.id);
      setSuccess("Apontamento excluído.");
    } catch (err) {
      throw new Error(getErrorMessage(err, "Não foi possível excluir o apontamento."));
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <Card className="p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="font-display text-lg text-ink-900">{title}</h2>
          {description && <p className="mt-0.5 text-sm text-ink-600">{description}</p>}
        </div>
        {canManage && (
          <Button type="button" size="sm" onClick={() => openModal({ mode: "create" })}>
            <Plus size={15} />
            {createLabel}
          </Button>
        )}
      </div>

      {toolbar && <div className="mt-4">{toolbar}</div>}

      {success && <SuccessMessage className="mt-4">{success}</SuccessMessage>}

      <div className="mt-4">
        {isLoading && <Loading label="Carregando apontamentos…" />}

        {isError && !isLoading && (
          <div className="flex flex-col items-center gap-3 py-8 text-center">
            <ErrorMessage className="mt-0">
              {getErrorMessage(error, "Não foi possível carregar os apontamentos.")}
            </ErrorMessage>
            <Button type="button" variant="secondary" size="sm" onClick={() => refetch()} isLoading={isFetching}>
              <RotateCw size={14} />
              Tentar de novo
            </Button>
          </div>
        )}

        {!isLoading && !isError && apontamentos.length === 0 && (
          <p className="py-8 text-center text-sm text-ink-500">{emptyMessage}</p>
        )}

        {!isLoading && !isError && apontamentos.length > 0 && (
          <>
            {/* Linha do tempo: do mais recente pro mais antigo (ordem da API). */}
            <ol className="relative space-y-4 border-l border-ink-900/10 pl-5" aria-label={title}>
              {apontamentos.map((apontamento) => (
                <li key={apontamento.id} className="relative">
                  <span
                    aria-hidden
                    className="absolute -left-[1.6rem] top-5 size-2.5 rounded-full border-2 border-surface bg-gold-500"
                  />
                  <ApontamentoCard
                    apontamento={apontamento}
                    vinculos={vinculos.labelDoVinculo(apontamento)}
                    showVisibilidade={canManage}
                    canManage={canManage}
                    onEdit={() => openModal({ mode: "edit", apontamento })}
                    onDelete={() => handleDelete(apontamento)}
                    isDeleting={deletingId === apontamento.id}
                  />
                </li>
              ))}
            </ol>
            <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
          </>
        )}
      </div>

      {canManage && (
        <Modal
          open={modal !== null}
          onClose={closeModal}
          title={modal?.mode === "edit" ? "Editar apontamento" : "Novo apontamento"}
        >
          {modal && (
            <ApontamentoForm
              // Remonta ao trocar de apontamento — defaultValues só vale no mount.
              key={modal.mode === "edit" ? modal.apontamento.id : "novo"}
              mode={modal.mode}
              defaultValues={
                modal.mode === "edit"
                  ? { texto: modal.apontamento.texto, compartilhar: modal.apontamento.visibilidade === "EMPRESA" }
                  : undefined
              }
              vinculoFixo={modal.mode === "create" ? vinculoFixo : undefined}
              vinculoLeitura={
                modal.mode === "edit" ? vinculos.labelDoVinculo(modal.apontamento).join(" · ") : undefined
              }
              diagnosticos={vinculos.diagnosticos}
              tarefas={vinculos.tarefas}
              isLoadingVinculos={vinculos.isLoading}
              onSubmit={handleSubmit}
              onCancel={closeModal}
              isSubmitting={createMutation.isPending || updateMutation.isPending}
              submitError={formError}
            />
          )}
        </Modal>
      )}
    </Card>
  );
}
