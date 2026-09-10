import { apiClient } from "@/lib/api-client";
import type { ApiEnvelope } from "@/types/api";

import type { EmpresaEvolucao } from "@/features/evolucao/types/evolucao.types";

/**
 * GET /empresas/:id/evolucao -> EmpresaEvolucao (envelope padrão). Rota
 * ainda sem autenticação no back-end — o apiClient manda o Bearer token de
 * qualquer forma quando existir, então nada muda no front se isso mudar.
 */
export const evolucaoService = {
  async getEmpresaEvolucao(empresaId: string): Promise<EmpresaEvolucao> {
    const response = await apiClient.get<ApiEnvelope<EmpresaEvolucao>>(`/empresas/${empresaId}/evolucao`);
    if (!response.data.data) throw new Error("Não foi possível carregar a evolução.");
    return response.data.data;
  },
};
