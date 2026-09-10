import type { TipoUsuario } from "@/features/auth";

/**
 * Tipos do domínio de gestão de usuários (CRUD feito por quem já está
 * logado). `AuthUser` — o registro em si — continua vindo de features/auth,
 * já que é o mesmo usuário que loga no sistema; aqui só ficam os shapes de
 * entrada específicos deste CRUD (create/update/filtros).
 */

export interface CreateUserInput {
  nome: string;
  email: string;
  senha: string;
  tipo_usuario: TipoUsuario;
  /** Obrigatório quando tipo_usuario é "EMPRESA"; omitido para "CONSULTOR". */
  empresa_id?: string;
  ativo: boolean;
}

export interface UpdateUserInput {
  nome: string;
  email: string;
  tipo_usuario: TipoUsuario;
  empresa_id?: string;
  ativo: boolean;
  /**
   * Assumido: o backend não documenta um endpoint dedicado de troca de
   * senha, só PUT /users/:id para o CRUD geral. O formulário de editar
   * usuário (EditUserForm) nunca envia este campo — só o fluxo de "Meu
   * perfil" (ver ChangePasswordForm/ProfilePage) inclui `senha` no payload,
   * mandando o restante dos campos inalterado. Se o backend expuser um
   * endpoint próprio pra isso, trocar só o service (usersService/ProfilePage).
   */
  senha?: string;
}

export interface UsersFilters {
  tipo_usuario?: TipoUsuario;
  ativo?: boolean;
}
