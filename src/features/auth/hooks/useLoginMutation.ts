import { useMutation } from "@tanstack/react-query";

import { authService } from "@/features/auth/services/auth.service";
import type { LoginCredentials } from "@/features/auth/types/auth.types";

/**
 * Encapsula a chamada de login via TanStack Query. A página de login não
 * conhece o service diretamente — só chama este hook, o que facilita testar
 * a página isoladamente (mockando o hook) e reaproveitar o fluxo em outro
 * lugar (ex: um modal de "sessão expirou, faça login novamente").
 */
export function useLoginMutation() {
  return useMutation({
    mutationFn: (credentials: LoginCredentials) => authService.login(credentials),
  });
}
