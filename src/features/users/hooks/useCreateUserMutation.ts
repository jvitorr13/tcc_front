import { useMutation, useQueryClient } from "@tanstack/react-query";

import { usersQueryKeys } from "@/features/users/hooks/users.query-keys";
import { usersService } from "@/features/users/services/users.service";
import type { CreateUserInput } from "@/features/users/types/user.types";

/**
 * Invalida a lista de usuários no sucesso — é assim que o usuário recém
 * cadastrado aparece na tela de Usuários sem precisar de nenhum estado
 * manual compartilhado entre as duas páginas.
 */
export function useCreateUserMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateUserInput) => usersService.create(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: usersQueryKeys.all });
    },
  });
}
