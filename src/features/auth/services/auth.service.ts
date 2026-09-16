import { apiClient } from "@/lib/api-client";
import type { ApiEnvelope } from "@/types/api";

import type {
  AuthUser,
  LoginCredentials,
  LoginResult,
  RegisterCredentials,
} from "@/features/auth/types/auth.types";

/**
 * Contrato de API do backend para autenticação (internal/auth):
 *
 *   POST /auth/login    { email, senha } -> { access_token, user }
 *   POST /auth/register { nome, email, senha, tipo_usuario } -> { user }
 *   GET  /auth/me        (Authorization: Bearer <token>) -> AuthUser
 *
 * access_token é um JWT válido por 24h. NÃO existe refresh token nem
 * endpoint de renovação — quando o token expira, o usuário loga de novo.
 * Não inventar esse fluxo aqui.
 *
 * Este service cobre só sessão/credenciais. O CRUD de usuários feito por
 * quem já está logado (listar, cadastrar, editar, excluir) mora em
 * features/users/services/users.service.ts (POST/GET/PUT/DELETE /users),
 * um domínio diferente do de autenticação apesar de ambos mexerem em
 * AuthUser.
 */

interface LoginResponseData {
  access_token: string;
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
