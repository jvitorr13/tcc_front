import { useQuery } from "@tanstack/react-query";

import { modelosQueryKeys } from "@/features/questionario/hooks/questionario.query-keys";
import { versoesService } from "@/features/questionario/services/versoes.service";

/** Árvore completa de uma versão (áreas -> perguntas -> opções), base do editor de nova versão. */
export function useVersaoQuery(versaoId: string | undefined) {
  return useQuery({
    queryKey: modelosQueryKeys.versao(versaoId ?? ""),
    queryFn: () => versoesService.getById(versaoId!),
    enabled: Boolean(versaoId),
  });
}
