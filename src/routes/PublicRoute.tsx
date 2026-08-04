import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";

import { Loading } from "@/components/feedback/Loading";
import { useAuth } from "@/hooks/useAuth";
import { ROUTES } from "@/constants/routes";

interface PublicRouteProps {
  children: ReactNode;
}

/**
 * Inverso do ProtectedRoute: usado em rotas que só fazem sentido para quem
 * NÃO está logado (ex: /login). Se a sessão já estiver ativa, manda o
 * usuário direto para a área privada em vez de mostrar o formulário de novo.
 */
export function PublicRoute({ children }: PublicRouteProps) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <Loading fullScreen label="Verificando sessão…" />;
  }

  if (isAuthenticated) {
    return <Navigate to={ROUTES.dashboard} replace />;
  }

  return <>{children}</>;
}
