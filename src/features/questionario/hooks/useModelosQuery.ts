import { useQuery } from "@tanstack/react-query";

import { modelosService } from "@/features/questionario/services/modelos.service";

export function useModelosQuery() {
  return useQuery({
    queryKey: ["modelos", "list"],
    queryFn: () => modelosService.list(),
  });
}
