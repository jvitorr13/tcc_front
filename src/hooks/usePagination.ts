import { useEffect, useMemo, useState } from "react";

import { ordenarMaisRecentes } from "@/utils/ordenar";

/**
 * Pagina client-side um array já filtrado (busca/filtros aplicados pela
 * própria página), sempre do mais recente para o mais antigo (ver
 * ordenarMaisRecentes). Volta pra página 1 sempre que `items` mudar de
 * referência — ou seja, sempre que a busca, os filtros ou os dados de
 * origem mudarem — pra nunca deixar o usuário "preso" numa página vazia.
 */
export function usePagination<T>(items: T[], pageSize = 10) {
  const [page, setPage] = useState(1);

  useEffect(() => {
    setPage(1);
  }, [items]);

  const ordenados = useMemo(() => ordenarMaisRecentes(items), [items]);

  const totalPages = Math.max(1, Math.ceil(ordenados.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const paginatedItems = ordenados.slice((safePage - 1) * pageSize, safePage * pageSize);

  return { page: safePage, setPage, totalPages, paginatedItems };
}
