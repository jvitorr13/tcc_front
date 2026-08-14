import { useQuery } from "@tanstack/react-query";

import { usersQueryKeys } from "@/features/users/hooks/users.query-keys";
import { usersService } from "@/features/users/services/users.service";
import type { UsersFilters } from "@/features/users/types/user.types";

export function useUsersQuery(filters: UsersFilters) {
  return useQuery({
    queryKey: usersQueryKeys.list(filters),
    queryFn: () => usersService.list(filters),
  });
}
