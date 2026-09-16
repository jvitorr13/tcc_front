import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";

import { Loading } from "@/components/feedback/Loading";
import { getInitialRoute } from "@/lib/get-initial-route";
import { useAuth } from "@/hooks/useAuth";

interface PublicRouteProps {
  children: ReactNode;
}

/**
 * Inverso do ProtectedRoute: usado em rotas que só fazem sentido para quem
 * NÃO está logado (ex: /login). Se a sessão já estiver ativa, manda o
 * usuário direto pra rota inicial do próprio perfil em vez de mostrar o
 * formulário de novo — usuário logado não deve conseguir ver a tela de
 * login de novo estando logado.
 */
export function PublicRoute({ children }: PublicRouteProps) {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <Loading fullScreen label="Verificando sessão…" />;
  }

  if (isAuthenticated && user) {
    return <Navigate to={getInitialRoute(user)} replace />;
  }

  return <>{children}</>;
}
