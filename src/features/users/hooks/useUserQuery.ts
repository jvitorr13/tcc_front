import { useQuery } from "@tanstack/react-query";

import { usersQueryKeys } from "@/features/users/hooks/users.query-keys";
import { usersService } from "@/features/users/services/users.service";

/**
 * `id` pode vir undefined no primeiro render (useParams antes da rota
 * resolver) — `enabled` segura a query até ele existir, sem precisar de
 * nenhum estado de loading artificial na página.
 */
export function useUserQuery(id: string | undefined) {
  return useQuery({
    queryKey: usersQueryKeys.detail(id ?? ""),
    queryFn: () => usersService.getById(id!),
    enabled: Boolean(id),
  });
}
