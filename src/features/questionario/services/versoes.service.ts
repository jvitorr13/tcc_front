import { apiClient } from "@/lib/api-client";
import type { ApiEnvelope } from "@/types/api";

import type { ModeloVersao } from "@/features/questionario/types/modelo.types";

/**
 * Contrato de API (internal/questionario), só CONSULTOR. O que se "ativa" é
 * uma VERSÃO de um modelo, não o modelo em si — só existe UMA versão ativa
 * no sistema inteiro, é ela que POST /diagnosticos usa pra montar as
 * perguntas de todo diagnóstico novo. Ativar uma versão inativa
 * automaticamente, na mesma transação, a que estava ativa antes (de
 * qualquer modelo) — o front não precisa inativar a antiga. Diagnósticos
 * já criados não mudam, ficam presos à versão com que foram criados.
 *
 *   GET  /questionario/versoes/:id         -> ModeloVersao com a árvore
 *     completa (áreas -> perguntas -> opcoes, já na ordem de exibição).
 *   POST /questionario/versoes/:id/ativar  -> { id, modelo_id,
 *     numero_versao, ativo, created_at } (sem `areas` nesta resposta)
 *
 * Ativar uma versão já ativa não é erro (devolve 200, nada muda). 404 se o
 * id não existir, 403 se o usuário não for CONSULTOR. Ver modelos.service.ts.
 */
const VERSOES_PATH = "/questionario/versoes";

export interface VersaoAtivacao {
  id: string;
  modelo_id: string;
  numero_versao: number;
  ativo: boolean;
  created_at: string;
}

export const versoesService = {
  async getById(versaoId: string): Promise<ModeloVersao> {
    const response = await apiClient.get<ApiEnvelope<ModeloVersao>>(`${VERSOES_PATH}/${versaoId}`);
    if (!response.data.data) throw new Error("Versão não encontrada.");
    return response.data.data;
  },

  async ativar(versaoId: string): Promise<VersaoAtivacao> {
    const response = await apiClient.post<ApiEnvelope<VersaoAtivacao>>(`${VERSOES_PATH}/${versaoId}/ativar`);
    if (!response.data.data) throw new Error("Não foi possível ativar a versão.");
    return response.data.data;
  },
};
