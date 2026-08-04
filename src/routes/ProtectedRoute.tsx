import type { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";

import { Loading } from "@/components/feedback/Loading";
import { useAuth } from "@/hooks/useAuth";
import { ROUTES } from "@/constants/routes";

interface ProtectedRouteProps {
  children: ReactNode;
}

/**
 * Envolve qualquer rota que exija sessão ativa. Três estados possíveis:
 *  - ainda verificando a sessão (bootstrap do AuthProvider)  -> Loading
 *  - sem sessão                                              -> redireciona para /login
 *  - com sessão                                               -> renderiza a rota
 *
 * Guarda a rota de origem em `state.from` para o login poder devolver o
 * usuário exatamente para onde ele tentou ir.
 */
export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <Loading fullScreen label="Verificando sessão…" />;
  }

  if (!isAuthenticated) {
    return <Navigate to={ROUTES.login} state={{ from: location }} replace />;
  }

  return <>{children}</>;
}
