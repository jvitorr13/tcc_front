import { ChevronDown, Filter } from "lucide-react";
import { type ReactNode, useEffect, useRef } from "react";

import { Button } from "@/components/ui/Button";

export interface AdvancedFilterPanelProps {
  /** Controles de filtro (children) — ligados a um estado "rascunho" da página, só viram filtro de verdade em onApply. */
  children: ReactNode;
  /** Quantos filtros aplicados estão com valor selecionado — vira um selo no botão. */
  activeCount?: number;
  /** Chamado ao abrir o painel — usado pela página pra sincronizar o rascunho com os filtros aplicados no momento. */
  onOpen?: () => void;
  onApply: () => void;
  onClear: () => void;
}

/**
 * Painel de Filtros Avançados: componente padrão para filtros em telas de
 * listagem. Um botão "Filtros" expande, no fluxo normal da página (nada de
 * position: absolute), uma seção com todos os filtros disponíveis — ao
 * abrir, empurra o que vem depois (a listagem) para baixo em vez de
 * flutuar por cima; ao fechar, o conteúdo abaixo volta pra posição
 * original. Mudanças nos campos só valem depois de "Aplicar filtros" (ou
 * são descartadas com "Limpar filtros"). Usa <details>/<summary> nativo
 * pro toggle — é exatamente esse elemento que dá o comportamento de
 * "empurrar o conteúdo abaixo" de graça, sem JS de layout.
 */
export function AdvancedFilterPanel({ children, activeCount = 0, onOpen, onApply, onClear }: AdvancedFilterPanelProps) {
  const detailsRef = useRef<HTMLDetailsElement>(null);

  useEffect(() => {
    const details = detailsRef.current;
    if (!details || !onOpen) return;

    function handleToggle() {
      if (details?.open) onOpen?.();
    }

    details.addEventListener("toggle", handleToggle);
    return () => details.removeEventListener("toggle", handleToggle);
  }, [onOpen]);

  function close() {
    if (detailsRef.current) detailsRef.current.open = false;
  }

  return (
    <details ref={detailsRef} className="group w-full rounded-lg border border-ink-900/15 bg-white">
      <summary className="flex h-11 cursor-pointer list-none items-center gap-2 px-4 text-sm font-medium text-ink-700 transition-colors marker:content-none hover:bg-ink-900/5 [&::-webkit-details-marker]:hidden">
        <Filter size={16} />
        Filtros
        {activeCount > 0 && (
          <span className="flex size-5 items-center justify-center rounded-full bg-gold-500 text-xs font-semibold text-white">
            {activeCount}
          </span>
        )}
        <ChevronDown size={16} className="ml-auto text-ink-500 transition-transform group-open:rotate-180" />
      </summary>

      <div className="border-t border-ink-900/8 p-4">
        <div className="flex flex-wrap gap-4">{children}</div>

        <div className="mt-5 flex justify-end gap-2 border-t border-ink-900/8 pt-4">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => {
              onClear();
              close();
            }}
          >
            Limpar filtros
          </Button>
          <Button
            type="button"
            size="sm"
            onClick={() => {
              onApply();
              close();
            }}
          >
            Aplicar filtros
          </Button>
        </div>
      </div>
    </details>
  );
}
