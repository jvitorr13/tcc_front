import { apiClient } from "@/lib/api-client";
import type { ApiEnvelope } from "@/types/api";

import type {
  AuthUser,
  LoginCredentials,
  LoginResult,
  RegisterCredentials,
} from "@/features/auth/types/auth.types";

/**
 * Contrato de API esperado do backend para autenticação:
 *
 *   POST /auth/login    { email, senha } -> { access_token, refresh_token?, user }
 *   POST /auth/register { nome, email, senha, tipo_usuario } -> { user }
 *   GET  /auth/me        (Authorization: Bearer <token>) -> AuthUser
 *   POST /auth/refresh   { refresh_token } -> { access_token, refresh_token? }
 *
 * Este service cobre só sessão/credenciais. O CRUD de usuários feito por
 * quem já está logado (listar, cadastrar, editar, excluir) mora em
 * features/users/services/users.service.ts (POST/GET/PUT/DELETE /users),
 * um domínio diferente do de autenticação apesar de ambos mexerem em
 * AuthUser. O backend hoje já implementa esse CRUD (internal/user); este
 * service assume que o módulo internal/auth (login/cadastro/JWT) segue a
 * mesma convenção de resposta (ApiEnvelope). Enquanto esse módulo não
 * existir no backend, as chamadas abaixo falham com erro de rede/404 — a UI
 * já trata isso normalmente (ver ErrorMessage nas páginas de login/cadastro).
 */

interface LoginResponseData {
  access_token: string;
  refresh_token?: string;
  user: AuthUser;
}

interface RegisterResponseData {
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

  async register(credentials: RegisterCredentials): Promise<AuthUser> {
    const response = await apiClient.post<ApiEnvelope<RegisterResponseData>>("/auth/register", credentials);
    const data = response.data.data;
    if (!data) {
      throw new Error("Resposta de cadastro inválida.");
    }
    return data.user;
  },

  async getCurrentUser(): Promise<AuthUser> {
    const response = await apiClient.get<ApiEnvelope<AuthUser>>("/auth/me");
    if (!response.data.data) {
      throw new Error("Não foi possível carregar o usuário atual.");
    }
    return response.data.data;
  },
};
