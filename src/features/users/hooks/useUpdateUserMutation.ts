import { useMutation, useQueryClient } from "@tanstack/react-query";

import { usersQueryKeys } from "@/features/users/hooks/users.query-keys";
import { usersService } from "@/features/users/services/users.service";
import type { UpdateUserInput } from "@/features/users/types/user.types";

interface UpdateUserVariables {
  id: string;
  input: UpdateUserInput;
}

export function useUpdateUserMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, input }: UpdateUserVariables) => usersService.update(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: usersQueryKeys.all });
    },
  });
}
