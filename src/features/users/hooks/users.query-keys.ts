import type { UsersFilters } from "@/features/users/types/user.types";

/**
 * Chaves de query centralizadas para o domínio de usuários. `all` é a base
 * usada para invalidar tudo de uma vez (ver mutations abaixo) — como
 * list/detail sempre começam com "users", invalidar `all` também invalida
 * qualquer lista filtrada e qualquer detalhe em cache.
 */
export const usersQueryKeys = {
  all: ["users"] as const,
  list: (filters: UsersFilters) => ["users", "list", filters] as const,
  detail: (id: string) => ["users", "detail", id] as const,
};
