import { useMutation, useQueryClient } from "@tanstack/react-query";

import { usersQueryKeys } from "@/features/users/hooks/users.query-keys";
import { usersService } from "@/features/users/services/users.service";

import type { AuthUser } from "@/features/auth";

/**
 * PUT /users/:id espera o objeto inteiro (não é PATCH parcial) — por isso
 * recebe o AuthUser atual e reenvia seus campos junto com a nova senha,
 * em vez de só {senha}. Ver o comentário em UpdateUserInput.senha.
 */
export function useChangePasswordMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ user, senha }: { user: AuthUser; senha: string }) =>
      usersService.update(user.id, {
        nome: user.nome,
        email: user.email,
        tipo_usuario: user.tipo_usuario,
        empresa_id: user.empresa_id,
        ativo: user.ativo,
        senha,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: usersQueryKeys.all });
    },
  });
}
