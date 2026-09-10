import { X } from "lucide-react";
import { type ReactNode, useEffect } from "react";
import { createPortal } from "react-dom";

import { cn } from "@/utils/cn";

export interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  className?: string;
}

/**
 * Modal genérico: fundo escurecido cobrindo a tela inteira + card
 * centralizado, renderizado via portal (fica acima de qualquer coisa,
 * independente de onde é chamado na árvore). Fecha com Esc, clique no fundo
 * ou no X — nunca ao clicar dentro do card. Usado para fluxos de criação
 * que precisam continuar na mesma tela (ex: Nova Tarefa dentro do detalhe
 * de um Plano de Ação), diferente de cadastros que têm rota própria
 * (Empresa, Usuário, Diagnóstico).
 */
export function Modal({ open, onClose, title, children, className }: ModalProps) {
  useEffect(() => {
    if (!open) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }

    document.addEventListener("keydown", handleKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [open, onClose]);

  if (!open) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-ink-950/50 px-4 py-10 backdrop-blur-[2px]"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onClick={(event) => event.stopPropagation()}
        className={cn("w-full max-w-lg rounded-2xl bg-surface p-6 shadow-xl sm:p-8", className)}
      >
        <div className="flex items-center justify-between gap-3">
          <h2 className="font-display text-lg text-ink-900">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            className="flex size-8 shrink-0 items-center justify-center rounded-lg text-ink-600 transition-colors hover:bg-ink-900/5 hover:text-ink-900"
            aria-label="Fechar"
          >
            <X size={18} />
          </button>
        </div>

        <div className="mt-5">{children}</div>
      </div>
    </div>,
    document.body,
  );
}
