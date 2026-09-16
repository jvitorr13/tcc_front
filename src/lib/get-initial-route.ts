import { ROUTES } from "@/constants/routes";
import type { AuthUser } from "@/features/auth/types/auth.types";

/**
 * Rota de destino após login ou restauração de sessão — sempre decidida
 * por tipo_usuario aqui, nunca "hardcoded" direto numa página (LoginPage,
 * PublicRoute, RoleRoute todos chamam esta função em vez de navegar pra um
 * path fixo). Hoje os dois perfis resolvem pra "/" porque é o conteúdo da
 * home (Sidebar/DashboardPage) que muda por papel, não a URL — mas o ponto
 * de decisão fica centralizado aqui, então se algum papel precisar de uma
 * home com URL própria no futuro, só este arquivo muda.
 */
export function getInitialRoute(user: Pick<AuthUser, "tipo_usuario">): string {
  switch (user.tipo_usuario) {
    case "CONSULTOR":
      return ROUTES.dashboard;
    case "EMPRESA":
      return ROUTES.dashboard;
  }
}
