import { useEffect, useState } from "react";

/**
 * Pagina client-side um array já filtrado (busca/filtros aplicados pela
 * própria página). Volta pra página 1 sempre que `items` mudar de
 * referência — ou seja, sempre que a busca, os filtros ou os dados de
 * origem mudarem — pra nunca deixar o usuário "preso" numa página vazia.
 */
export function usePagination<T>(items: T[], pageSize = 10) {
  const [page, setPage] = useState(1);

  useEffect(() => {
    setPage(1);
  }, [items]);

  const totalPages = Math.max(1, Math.ceil(items.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const paginatedItems = items.slice((safePage - 1) * pageSize, safePage * pageSize);

  return { page: safePage, setPage, totalPages, paginatedItems };
}
