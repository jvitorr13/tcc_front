import type { UseQueryResult } from "@tanstack/react-query";

export interface CombinedListResult<T> {
  data: T[] | undefined;
  isLoading: boolean;
  isError: boolean;
  error: Error | null | undefined;
}

/**
 * `combine` de useQueries pra listas buscadas por empresa e juntadas.
 * Precisa ser uma referência ESTÁVEL (definida no módulo, nunca inline):
 * assim o React Query só recalcula quando algum resultado muda e `data`
 * mantém a mesma referência entre renders. Com um flatMap a cada render,
 * usePagination (que volta pra página 1 quando a lista muda de referência)
 * resetava a página a cada clique.
 */
export function combineListQueries<T>(results: UseQueryResult<T[]>[]): CombinedListResult<T> {
  return {
    data: results.every((result) => result.data !== undefined)
      ? results.flatMap((result) => result.data ?? [])
      : undefined,
    isLoading: results.some((result) => result.isLoading),
    isError: results.some((result) => result.isError),
    error: results.find((result) => result.isError)?.error,
  };
}
