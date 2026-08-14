import { httpService } from "@/services/http.service";

import type { AuthUser } from "@/features/auth";
import type { CreateUserInput, UpdateUserInput, UsersFilters } from "@/features/users/types/user.types";

/**
 * Contrato de API esperado do backend para o CRUD de usuários
 * (internal/user), sempre autenticado — o Bearer token já vai em toda
 * chamada via interceptor do apiClient (ver lib/api-client.ts):
 *
 *   GET    /users?tipo_usuario=&ativo=&page=&page_size=  -> AuthUser[] (paginado, meta com ApiPagination)
 *   GET    /users/:id                    -> AuthUser
 *   POST   /users                        { nome, email, senha, tipo_usuario, empresa_id?, ativo } -> AuthUser
 *   PUT    /users/:id                    { nome, email, tipo_usuario, empresa_id?, ativo } -> AuthUser
 *   DELETE /users/:id                    -> 204
 *
 * `empresa_id` só se aplica (e só é enviado) quando tipo_usuario é
 * "EMPRESA" — ver validação em schemas/create-user.schema.ts e
 * schemas/edit-user.schema.ts.
 *
 * Construído sobre httpService (services/http.service.ts) em vez de chamar
 * apiClient diretamente — é a camada genérica já preparada para isso.
 *
 * `list` busca uma página grande (page_size alto) porque a paginação da
 * tela de Usuários é client-side, sobre a lista inteira já carregada (ver
 * usePagination em UsersListPage) — mesma decisão tomada em
 * empresasService.list.
 */
const USERS_PATH = "/users";

export const usersService = {
  async list(filters: UsersFilters = {}): Promise<AuthUser[]> {
    const { items } = await httpService.list<AuthUser>(USERS_PATH, {
      tipo_usuario: filters.tipo_usuario,
      ativo: filters.ativo,
      page: 1,
      page_size: 100,
    });
    return items;
  },

  getById: (id: string) => httpService.getById<AuthUser>(USERS_PATH, id),

  create: (input: CreateUserInput) => httpService.create<AuthUser, CreateUserInput>(USERS_PATH, input),

  update: (id: string, input: UpdateUserInput) =>
    httpService.update<AuthUser, UpdateUserInput>(USERS_PATH, id, input),

  remove: (id: string) => httpService.remove(USERS_PATH, id),
};
