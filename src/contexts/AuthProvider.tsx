import { type ReactNode, useCallback, useEffect } from "react";

import { authEventBus } from "@/lib/auth-event-bus";
import { tokenStorage } from "@/lib/token-storage";
import { useAuthStore } from "@/stores/auth.store";

import { AuthContext, type AuthContextValue } from "@/contexts/AuthContext";
import { authService } from "@/features/auth/services/auth.service";
import type { LoginCredentials } from "@/features/auth/types/auth.types";

interface AuthProviderProps {
  children: ReactNode;
}

/**
 * Orquestra o ciclo de vida da sessão:
 *  1. Ao montar, se existe um token salvo, tenta buscar o usuário atual
 *     (GET /auth/me) para restaurar a sessão sem exigir novo login.
 *  2. Expõe login()/logout() que atualizam o authStore (Zustand).
 *  3. Escuta o evento "session-expired" emitido pelo interceptor do Axios
 *     (lib/api-client.ts) quando o refresh token falha, e desloga o usuário.
 *
 * Deve envolver toda a árvore de rotas em main.tsx/App, acima do
 * RouterProvider, para que ProtectedRoute/PublicRoute consigam ler o
 * status via useAuth().
 */
export function AuthProvider({ children }: AuthProviderProps) {
  const { user, status, setSession, setStatus, clearSession } = useAuthStore();

  const bootstrap = useCallback(async () => {
    const token = tokenStorage.getAccessToken();
    if (!token) {
      setStatus("unauthenticated");
      return;
    }

    setStatus("loading");
    try {
      const currentUser = await authService.getCurrentUser();
      useAuthStore.setState({ user: currentUser, status: "authenticated" });
    } catch {
      clearSession();
    }
  }, [clearSession, setStatus]);

  useEffect(() => {
    bootstrap();
  }, [bootstrap]);

  useEffect(() => {
    return authEventBus.on("session-expired", () => {
      clearSession();
    });
  }, [clearSession]);

  const login = useCallback(
    async (credentials: LoginCredentials) => {
      const { accessToken, refreshToken, user: loggedUser } = await authService.login(credentials);
      setSession(loggedUser, accessToken, refreshToken);
    },
    [setSession],
  );

  const logout = useCallback(() => {
    clearSession();
  }, [clearSession]);

  const value: AuthContextValue = {
    user,
    status,
    isAuthenticated: status === "authenticated",
    isLoading: status === "idle" || status === "loading",
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
