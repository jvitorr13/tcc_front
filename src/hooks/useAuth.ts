import { useContext } from "react";

import { AuthContext } from "@/contexts/AuthContext";

/**
 * Hook público para consumir autenticação em qualquer componente:
 *   const { user, isAuthenticated, login, logout } = useAuth();
 *
 * Lança um erro claro se usado fora de <AuthProvider>, em vez de retornar
 * undefined silenciosamente — evita bugs sutis de "user is undefined".
 */
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth deve ser usado dentro de um <AuthProvider>.");
  }
  return context;
}
