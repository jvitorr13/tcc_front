import { useQuery } from "@tanstack/react-query";

import { modelosQueryKeys } from "@/features/questionario/hooks/questionario.query-keys";
import { modelosService } from "@/features/questionario/services/modelos.service";

export function useModelosQuery() {
  return useQuery({
    queryKey: modelosQueryKeys.list(),
    queryFn: () => modelosService.list(),
  });
}
