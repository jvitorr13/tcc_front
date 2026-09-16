import type { ReactNode } from "react";
import { Navigate, useParams, useSearchParams } from "react-router-dom";

import { getInitialRoute } from "@/lib/get-initial-route";
import { useAuth } from "@/hooks/useAuth";
import type { TipoUsuario } from "@/features/auth";

interface RoleRouteProps {
  children: ReactNode;
  /** Perfis que podem acessar esta rota. */
  allow: TipoUsuario[];
  /**
   * Rotas empresa-escopadas — quando o usuário é EMPRESA, exige que o
   * empresa_id da URL seja o próprio empresa_id dele. Evita ver dados de
   * outra empresa só trocando o id na URL; para CONSULTOR não tem
   * restrição nenhuma (pode ver qualquer empresa).
   */
  requireOwnEmpresaId?: boolean;
  /**
   * Por padrão o empresa_id vem do :id do path (ex: /empresas/:id/evolucao).
   * Quando a rota carrega o empresa_id como querystring em vez de path
   * param (ex: /diagnosticos/:id?empresa=...), passar o nome do parâmetro
   * aqui em vez de depender do :id.
   */
  empresaIdSearchParam?: string;
}

/**
 * Guard por tipo_usuario, para usar DENTRO de um <ProtectedRoute> (que já
 * garante sessão ativa — aqui `user` nunca é null de fato). Se o perfil não
 * está em `allow`, ou é EMPRESA tentando acessar o dado de outra empresa,
 * redireciona pra rota inicial do próprio perfil em vez de deixar a tela
 * carregar e esperar um 403 do back-end.
 */
export function RoleRoute({ children, allow, requireOwnEmpresaId, empresaIdSearchParam }: RoleRouteProps) {
  const { user } = useAuth();
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();

  if (!user) return null;

  const empresaIdFromRoute = empresaIdSearchParam ? searchParams.get(empresaIdSearchParam) : id;

  const isAllowed = allow.includes(user.tipo_usuario);
  const isOwnEmpresa =
    !requireOwnEmpresaId || user.tipo_usuario !== "EMPRESA" || empresaIdFromRoute === user.empresa_id;

  if (!isAllowed || !isOwnEmpresa) {
    return <Navigate to={getInitialRoute(user)} replace />;
  }

  return <>{children}</>;
}
