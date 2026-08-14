import { useMutation } from "@tanstack/react-query";

import { authService } from "@/features/auth/services/auth.service";
import type { RegisterCredentials } from "@/features/auth/types/auth.types";

/**
 * Encapsula a chamada de cadastro via TanStack Query. Diferente do login,
 * cadastro não abre sessão (o usuário é enviado para /login em seguida), então
 * não precisa passar pelo AuthContext — só executa a mutation e expõe
 * status/erro para a página exibir.
 */
export function useRegisterMutation() {
  return useMutation({
    mutationFn: (credentials: RegisterCredentials) => authService.register(credentials),
  });
}
