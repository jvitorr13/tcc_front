import { useMutation, useQueryClient } from "@tanstack/react-query";

import { apontamentosQueryKeys } from "@/features/apontamentos/hooks/apontamentos.query-keys";
import { apontamentosService } from "@/features/apontamentos/services/apontamentos.service";
import type { CreateApontamentoInput, UpdateApontamentoInput } from "@/features/apontamentos/types/apontamento.types";

/*
 * As três mutations invalidam todas as listas da empresa (a geral e as
 * filtradas por diagnóstico/tarefa), pra qualquer tela aberta se atualizar.
 */

export function useCreateApontamentoMutation(empresaId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateApontamentoInput) => apontamentosService.create(empresaId, input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: apontamentosQueryKeys.empresa(empresaId) }),
  });
}

export function useUpdateApontamentoMutation(empresaId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateApontamentoInput }) => apontamentosService.update(id, input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: apontamentosQueryKeys.empresa(empresaId) }),
  });
}

export function useDeleteApontamentoMutation(empresaId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apontamentosService.remove(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: apontamentosQueryKeys.empresa(empresaId) }),
  });
}
