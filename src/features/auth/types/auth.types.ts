/**
 * Tipos do domínio de autenticação. Espelham o backend (internal/user +
 * futuro internal/auth), mas ficam declarados aqui porque é o front quem
 * define o contrato que consome — o service é quem garante que a resposta
 * da API seja compatível com este tipo.
 */

export type TipoUsuario = "CONSULTOR" | "EMPRESA";

export interface AuthUser {
  id: string;
  nome: string;
  email: string;
  tipo_usuario: TipoUsuario;
  /** Só preenchido para usuários com tipo_usuario "EMPRESA". */
  empresa_id?: string;
  ativo: boolean;
}

export interface LoginCredentials {
  email: string;
  senha: string;
}

export interface LoginResult {
  accessToken: string;
  refreshToken?: string;
  user: AuthUser;
}

export interface RegisterCredentials {
  nome: string;
  email: string;
  senha: string;
  tipo_usuario: TipoUsuario;
}
