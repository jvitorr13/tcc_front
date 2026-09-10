import { apiClient } from "@/lib/api-client";
import type { ApiEnvelope } from "@/types/api";

import type { EmpresaDashboard } from "@/features/dashboard/types/dashboard.types";

/**
 * GET /empresas/:id/dashboard -> EmpresaDashboard (envelope padrão). Rota
 * ainda sem autenticação no back-end — o apiClient manda o Bearer token de
 * qualquer forma quando existir, então nada muda no front se isso mudar.
 * Sem empresa_id na querystring (vai na própria URL); empresa sem tarefas
 * não é erro, volta tudo zerado (ver EmpresaDashboardPage para o estado vazio).
 */
export const dashboardService = {
  async getEmpresaDashboard(empresaId: string): Promise<EmpresaDashboard> {
    const response = await apiClient.get<ApiEnvelope<EmpresaDashboard>>(`/empresas/${empresaId}/dashboard`);
    if (!response.data.data) throw new Error("Não foi possível carregar o dashboard.");
    return response.data.data;
  },
};
