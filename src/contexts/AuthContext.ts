import { createContext } from "react";

import type { AuthStatus } from "@/stores/auth.store";
import type { AuthUser, LoginCredentials } from "@/features/auth/types/auth.types";

export interface AuthContextValue {
  user: AuthUser | null;
  status: AuthStatus;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => void;
}

/**
 * Contexto puro — só a definição do "shape". A lógica mora em
 * AuthProvider.tsx e o consumo em hooks/useAuth.ts. Manter a definição
 * separada evita problemas de Fast Refresh (arquivo que só exporta
 * componente x arquivo que só exporta contexto/hook).
 */
export const AuthContext = createContext<AuthContextValue | undefined>(undefined);
