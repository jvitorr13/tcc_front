import { ChevronLeft, ChevronRight } from "lucide-react";

import { cn } from "@/utils/cn";

export interface PaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

/**
 * Paginador padrão para o rodapé de listagens. Recebe a página atual e o
 * total de páginas já calculados pela página que a usa — não sabe nada
 * sobre a fonte dos dados (API paginada ou lista filtrada client-side).
 * Não renderiza nada quando cabe tudo em uma página só.
 */
export function Pagination({ page, totalPages, onPageChange }: PaginationProps) {
  if (totalPages <= 1) return null;

  const pages = buildPageList(page, totalPages);

  return (
    <nav className="flex items-center justify-center gap-1 pt-6" aria-label="Paginação">
      <button
        type="button"
        onClick={() => onPageChange(page - 1)}
        disabled={page === 1}
        className="flex size-9 items-center justify-center rounded-lg text-ink-600 transition-colors hover:bg-ink-900/5 disabled:pointer-events-none disabled:opacity-40"
        aria-label="Página anterior"
      >
        <ChevronLeft size={16} />
      </button>

      {pages.map((p, index) =>
        p === "..." ? (
          <span key={`ellipsis-${index}`} className="px-1.5 text-sm text-ink-400">
            …
          </span>
        ) : (
          <button
            key={p}
            type="button"
            onClick={() => onPageChange(p)}
            aria-current={p === page ? "page" : undefined}
            className={cn(
              "flex size-9 items-center justify-center rounded-lg text-sm font-medium transition-colors",
              p === page ? "bg-ink-900 text-white" : "text-ink-700 hover:bg-ink-900/5",
            )}
          >
            {p}
          </button>
        ),
      )}

      <button
        type="button"
        onClick={() => onPageChange(page + 1)}
        disabled={page === totalPages}
        className="flex size-9 items-center justify-center rounded-lg text-ink-600 transition-colors hover:bg-ink-900/5 disabled:pointer-events-none disabled:opacity-40"
        aria-label="Próxima página"
      >
        <ChevronRight size={16} />
      </button>
    </nav>
  );
}

/** Janela de páginas ao redor da atual, com "…" quando há salto até 1ª/última. */
function buildPageList(current: number, total: number): (number | "...")[] {
  const delta = 1;
  const left = Math.max(2, current - delta);
  const right = Math.min(total - 1, current + delta);

  const range: (number | "...")[] = [1];
  if (left > 2) range.push("...");
  for (let page = left; page <= right; page++) range.push(page);
  if (right < total - 1) range.push("...");
  range.push(total);

  return range;
}
