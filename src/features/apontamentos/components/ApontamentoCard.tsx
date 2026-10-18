import { Link2, Pencil, Trash2 } from "lucide-react";
import { useState } from "react";

import { ErrorMessage } from "@/components/feedback/ErrorMessage";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { formatDateTime } from "@/utils/format";

import type { Apontamento } from "@/features/apontamentos/types/apontamento.types";

export interface ApontamentoCardProps {
  apontamento: Apontamento;
  /** Etiquetas do vínculo já resolvidas (ex.: "Tarefa: Padronizar vendas"). */
  vinculos: string[];
  /** Selo Interno/Compartilhado — pra EMPRESA não faz sentido (ela só recebe os compartilhados). */
  showVisibilidade: boolean;
  /** Botões editar/excluir — só CONSULTOR. */
  canManage: boolean;
  onEdit?: () => void;
  onDelete?: () => Promise<void>;
  isDeleting?: boolean;
}

/**
 * Um item da linha do tempo de apontamentos. Excluir pede confirmação no
 * próprio card (mesmo padrão de TarefaCard), sem modal.
 */
export function ApontamentoCard({
  apontamento,
  vinculos,
  showVisibilidade,
  canManage,
  onEdit,
  onDelete,
  isDeleting,
}: ApontamentoCardProps) {
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  async function handleConfirmDelete() {
    if (!onDelete) return;
    setDeleteError(null);
    try {
      await onDelete();
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : "Não foi possível excluir o apontamento.");
      setConfirmingDelete(false);
    }
  }

  const editado = apontamento.updated_at !== apontamento.created_at;

  return (
    <article className="rounded-xl border border-ink-900/8 bg-surface p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <p className="text-xs text-ink-500">
          <time dateTime={apontamento.created_at} className="font-medium tabular-nums text-ink-700">
            {formatDateTime(apontamento.created_at)}
          </time>
          <span aria-hidden> · </span>
          {apontamento.autor_nome}
          {editado && <span title={`Editado em ${formatDateTime(apontamento.updated_at)}`}> · editado</span>}
        </p>

        {canManage && !confirmingDelete && (
          <div className="flex items-center gap-1">
            <Button type="button" variant="ghost" size="sm" onClick={onEdit} aria-label="Editar apontamento">
              <Pencil size={14} />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setConfirmingDelete(true)}
              aria-label="Excluir apontamento"
            >
              <Trash2 size={14} />
            </Button>
          </div>
        )}
      </div>

      <p className="mt-2 whitespace-pre-wrap break-words text-sm leading-relaxed text-ink-900">{apontamento.texto}</p>

      {(vinculos.length > 0 || showVisibilidade) && (
        <div className="mt-3 flex flex-wrap items-center gap-2">
          {vinculos.map((vinculo) => (
            <Badge key={vinculo} variant="neutral" className="gap-1">
              <Link2 size={11} aria-hidden />
              {vinculo}
            </Badge>
          ))}
          {showVisibilidade && (
            <Badge variant={apontamento.visibilidade === "EMPRESA" ? "gold" : "neutral"}>
              {apontamento.visibilidade === "EMPRESA" ? "Compartilhado com a empresa" : "Interno"}
            </Badge>
          )}
        </div>
      )}

      {confirmingDelete && (
        <div className="mt-3 flex flex-wrap items-center gap-3 rounded-lg bg-danger-50 px-3 py-2.5">
          <p className="text-sm text-ink-700">Excluir este apontamento? Essa ação não pode ser desfeita.</p>
          <div className="ml-auto flex gap-2">
            <Button type="button" variant="secondary" size="sm" onClick={() => setConfirmingDelete(false)}>
              Cancelar
            </Button>
            <Button type="button" variant="danger" size="sm" onClick={handleConfirmDelete} isLoading={isDeleting}>
              Excluir
            </Button>
          </div>
        </div>
      )}

      {deleteError && <ErrorMessage>{deleteError}</ErrorMessage>}
    </article>
  );
}
