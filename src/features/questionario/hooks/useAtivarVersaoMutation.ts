import { useMutation, useQueryClient } from "@tanstack/react-query";

import { modelosQueryKeys } from "@/features/questionario/hooks/questionario.query-keys";
import { versoesService } from "@/features/questionario/services/versoes.service";

export function useAtivarVersaoMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (versaoId: string) => versoesService.ativar(versaoId),
    onSuccess: () => {
      // Ativar inativa a versão ativa anterior de qualquer modelo no
      // back-end, não só a deste modelo — invalida a lista inteira pra
      // refletir o status de todo mundo, não só quem foi clicado.
      queryClient.invalidateQueries({ queryKey: modelosQueryKeys.all });
    },
  });
}
