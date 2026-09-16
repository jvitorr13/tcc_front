import { create } from "zustand";

import { tokenStorage } from "@/lib/token-storage";

import type { AuthUser } from "@/features/auth/types/auth.types";

export type AuthStatus = "idle" | "loading" | "authenticated" | "unauthenticated";

interface AuthState {
  user: AuthUser | null;
  status: AuthStatus;
  setSession: (user: AuthUser, accessToken: string) => void;
  setStatus: (status: AuthStatus) => void;
  clearSession: () => void;
}

/**
 * Store global de autenticação (Zustand). É a fonte da verdade sobre "quem
 * está logado" — usada pelo AuthContext/AuthProvider (contexts/AuthContext)
 * para expor uma API mais rica via useAuth(), e também acessível fora da
 * árvore React se necessário (ex: em um helper fora de componente).
 */
export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  status: "idle",

  setSession: (user, accessToken) => {
    tokenStorage.setAccessToken(accessToken);
    set({ user, status: "authenticated" });
  },

  setStatus: (status) => set({ status }),

  clearSession: () => {
    tokenStorage.clear();
    set({ user: null, status: "unauthenticated" });
  },
}));
