import { useQuery } from "@tanstack/react-query";

import { diagnosticosQueryKeys } from "@/features/diagnosticos/hooks/diagnosticos.query-keys";
import { diagnosticosService } from "@/features/diagnosticos/services/diagnosticos.service";

/**
 * Não existe GET /diagnosticos/:id no backend — só GET /diagnosticos com
 * empresa_id obrigatório. Então busca a lista da empresa e acha o
 * diagnóstico dentro dela. É por isso que a tela de detalhe precisa saber
 * o empresa_id além do id (ver diagnosticoDetalhePath, que carrega
 * ?empresa= na própria URL — sem isso não dá pra abrir o link direto/dar
 * refresh na página).
 */
export function useDiagnosticoQuery(id: string | undefined, empresaId: string | undefined) {
  return useQuery({
    queryKey: diagnosticosQueryKeys.detail(id ?? "", empresaId ?? ""),
    queryFn: async () => {
      const diagnosticos = await diagnosticosService.list(empresaId!);
      const found = diagnosticos.find((diagnostico) => diagnostico.id === id);
      if (!found) throw new Error("Diagnóstico não encontrado.");
      return found;
    },
    enabled: Boolean(id) && Boolean(empresaId),
  });
}
