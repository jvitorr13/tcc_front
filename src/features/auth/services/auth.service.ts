import { apiClient } from "@/lib/api-client";
import type { ApiEnvelope } from "@/types/api";

import type { AuthUser, LoginCredentials, LoginResult } from "@/features/auth/types/auth.types";

/**
 * Contrato de API esperado do backend para autenticação:
 *
 *   POST /auth/login   { email, senha } -> { access_token, refresh_token?, user }
 *   GET  /auth/me       (Authorization: Bearer <token>) -> AuthUser
 *   POST /auth/refresh  { refresh_token } -> { access_token, refresh_token? }
 *
 * O backend hoje já implementa o CRUD de usuários (internal/user); este
 * service assume que o módulo internal/auth (login/JWT) segue a mesma
 * convenção de resposta (ApiEnvelope). Enquanto esse módulo não existir no
 * backend, as chamadas abaixo falham com erro de rede/404 — a UI já trata
 * isso normalmente (ver ErrorMessage na página de login).
 */

interface LoginResponseData {
  access_token: string;
  refresh_token?: string;
  user: AuthUser;
}

export const authService = {
  async login(credentials: LoginCredentials): Promise<LoginResult> {
    const response = await apiClient.post<ApiEnvelope<LoginResponseData>>("/auth/login", credentials);
    const data = response.data.data;
    if (!data) {
      throw new Error("Resposta de login inválida.");
    }
    return {
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
      user: data.user,
    };
  },

  async getCurrentUser(): Promise<AuthUser> {
    const response = await apiClient.get<ApiEnvelope<AuthUser>>("/auth/me");
    if (!response.data.data) {
      throw new Error("Não foi possível carregar o usuário atual.");
    }
    return response.data.data;
  },
};
