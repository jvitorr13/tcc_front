import { AlertTriangle, Pencil, Trash2 } from "lucide-react";
import { useState } from "react";

import { ErrorMessage } from "@/components/feedback/ErrorMessage";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Label } from "@/components/ui/Label";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { cn } from "@/utils/cn";
import { formatDate } from "@/utils/format";

import type { Tarefa, TarefaStatus, UpdateTarefaInput } from "@/features/plano-acao/types/plano-acao.types";

export interface TarefaCardProps {
  tarefa: Tarefa;
  /** Nome do usuário de responsavel_id, achado pela página; sem ele cai em tarefa.responsavel. */
  responsavelNome?: string;
  onUpdate: (input: UpdateTarefaInput) => Promise<void>;
  isUpdating: boolean;
  onDelete: () => void;
  isDeleting: boolean;
}

const STATUS_LABELS: Record<TarefaStatus, string> = {
  PENDENTE: "Pendente",
  EM_ANDAMENTO: "Em andamento",
  CONCLUIDA: "Concluída",
};

const STATUS_VARIANTS: Record<TarefaStatus, "neutral" | "gold" | "success"> = {
  PENDENTE: "neutral",
  EM_ANDAMENTO: "gold",
  CONCLUIDA: "success",
};

const PRIORIDADE_LABELS: Record<Tarefa["prioridade"], string> = {
  BAIXA: "Baixa",
  MEDIA: "Média",
  ALTA: "Alta",
};

const PRIORIDADE_VARIANTS: Record<Tarefa["prioridade"], "neutral" | "gold" | "danger"> = {
  BAIXA: "neutral",
  MEDIA: "gold",
  ALTA: "danger",
};

/**
 * Card de uma tarefa: exibição + edição inline restrita a status/observação
 * (os únicos campos que o front deixa o usuário alterar depois de criada —
 * ver PUT /planos-acao/:id/tarefas/:tarefaId). `atrasada` só é lida do
 * back-end, nunca recalculada aqui.
 */
export function TarefaCard({ tarefa, responsavelNome, onUpdate, isUpdating, onDelete, isDeleting }: TarefaCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [draftStatus, setDraftStatus] = useState<TarefaStatus>(tarefa.status);
  const [draftObservacao, setDraftObservacao] = useState(tarefa.observacao);
  const [saveError, setSaveError] = useState<string | null>(null);

  function handleStartEdit() {
    setDraftStatus(tarefa.status);
    setDraftObservacao(tarefa.observacao);
    setSaveError(null);
    setIsEditing(true);
  }

  async function handleSave() {
    setSaveError(null);
    try {
      await onUpdate({ status: draftStatus, observacao: draftObservacao });
      setIsEditing(false);
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "Não foi possível salvar a tarefa.");
    }
  }

  return (
    <div
      className={cn(
        "rounded-lg border p-4",
        tarefa.atrasada ? "border-danger-500/30 bg-danger-50/60" : "border-ink-900/8",
      )}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <p className="text-sm font-medium text-ink-900">{tarefa.titulo}</p>
            {tarefa.atrasada && (
              <Badge variant="danger" className="gap-1">
                <AlertTriangle size={11} />
                Atrasada
              </Badge>
            )}
          </div>
          {tarefa.descricao && <p className="mt-1 text-sm text-ink-600">{tarefa.descricao}</p>}
        </div>

        {!isEditing && !confirmingDelete && (
          <div className="flex shrink-0 items-center gap-1">
            <Button type="button" variant="ghost" size="sm" onClick={handleStartEdit} aria-label="Editar tarefa">
              <Pencil size={14} />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setConfirmingDelete(true)}
              aria-label="Excluir tarefa"
            >
              <Trash2 size={14} />
            </Button>
          </div>
        )}
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-1.5 text-xs text-ink-600">
        <span>Responsável: {responsavelNome ?? (tarefa.responsavel || "—")}</span>
        {tarefa.prazo && <span>Prazo: {formatDate(tarefa.prazo)}</span>}
        <Badge variant={PRIORIDADE_VARIANTS[tarefa.prioridade]}>{PRIORIDADE_LABELS[tarefa.prioridade]}</Badge>
        {!isEditing && <Badge variant={STATUS_VARIANTS[tarefa.status]}>{STATUS_LABELS[tarefa.status]}</Badge>}
      </div>

      {!isEditing && tarefa.observacao && (
        <p className="mt-2 rounded-md bg-ink-900/[0.03] px-3 py-2 text-xs text-ink-600">{tarefa.observacao}</p>
      )}

      {isEditing && (
        <div className="mt-4 space-y-3 border-t border-ink-900/8 pt-4">
          <div>
            <Label htmlFor={`tarefa-status-${tarefa.id}`}>Status</Label>
            <Select
              id={`tarefa-status-${tarefa.id}`}
              value={draftStatus}
              onChange={(event) => setDraftStatus(event.target.value as TarefaStatus)}
            >
              <option value="PENDENTE">Pendente</option>
              <option value="EM_ANDAMENTO">Em andamento</option>
              <option value="CONCLUIDA">Concluída</option>
            </Select>
          </div>

          <div>
            <Label htmlFor={`tarefa-observacao-${tarefa.id}`}>Observações</Label>
            <Textarea
              id={`tarefa-observacao-${tarefa.id}`}
              value={draftObservacao}
              onChange={(event) => setDraftObservacao(event.target.value)}
              rows={2}
            />
          </div>

          {saveError && <ErrorMessage>{saveError}</ErrorMessage>}

          <div className="flex gap-2">
            <Button type="button" variant="secondary" size="sm" onClick={() => setIsEditing(false)} disabled={isUpdating}>
              Cancelar
            </Button>
            <Button type="button" size="sm" onClick={handleSave} isLoading={isUpdating}>
              Salvar
            </Button>
          </div>
        </div>
      )}

      {confirmingDelete && (
        <div className="mt-4 flex items-center justify-between gap-3 border-t border-ink-900/8 pt-4">
          <span className="text-xs text-ink-600">Excluir esta tarefa?</span>
          <div className="flex gap-2">
            <Button type="button" variant="secondary" size="sm" onClick={() => setConfirmingDelete(false)} disabled={isDeleting}>
              Cancelar
            </Button>
            <Button type="button" variant="danger" size="sm" onClick={onDelete} isLoading={isDeleting}>
              Confirmar
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
