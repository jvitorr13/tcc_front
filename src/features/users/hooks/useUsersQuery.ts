import { useQuery } from "@tanstack/react-query";

import { usersQueryKeys } from "@/features/users/hooks/users.query-keys";
import { usersService } from "@/features/users/services/users.service";
import type { UsersFilters } from "@/features/users/types/user.types";

/** GET /users é só CONSULTOR — `enabled` desliga nas telas que a EMPRESA também abre. */
export function useUsersQuery(filters: UsersFilters, { enabled = true }: { enabled?: boolean } = {}) {
  return useQuery({
    queryKey: usersQueryKeys.list(filters),
    queryFn: () => usersService.list(filters),
    enabled,
  });
}
