import { useQuery } from "@tanstack/react-query";

import { empresasQueryKeys } from "@/features/empresas/hooks/empresas.query-keys";
import { empresasService } from "@/features/empresas/services/empresas.service";

interface UseEmpresasQueryOptions {
  incluirInativas?: boolean;
  /** GET /empresas é só CONSULTOR (EMPRESA leva 403) — desligar nas telas que a EMPRESA também abre. */
  enabled?: boolean;
}

/**
 * Por padrão só empresas ativas (padrão da API) — é o que os seletores de
 * empresa precisam. `incluirInativas` é pra tela de Empresas, que filtra
 * ativa/inativa client-side.
 */
export function useEmpresasQuery({ incluirInativas = false, enabled = true }: UseEmpresasQueryOptions = {}) {
  return useQuery({
    queryKey: empresasQueryKeys.list(incluirInativas),
    queryFn: () => empresasService.list(incluirInativas),
    enabled,
  });
}
