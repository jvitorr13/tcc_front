import { QueryClient } from "@tanstack/react-query";

/**
 * Instância única do QueryClient. Fica em lib/ (infraestrutura), não em
 * main.tsx, para poder ser importada em testes ou em qualquer outro lugar
 * que precise disparar queries fora da árvore React (raro, mas evita
 * recriar o client em outro ponto do app).
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 30_000,
      refetchOnWindowFocus: false,
    },
  },
});
