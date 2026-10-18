import { apiClient } from "@/lib/api-client";
import { httpService } from "@/services/http.service";
import type { ApiEnvelope } from "@/types/api";

import type {
  CreateIndicadorInput,
  CreateIndicadorValorInput,
  Indicador,
  IndicadorValor,
  UpdateIndicadorInput,
} from "@/features/indicadores/types/indicador.types";

/**
 * Contrato de API (internal/indicador) — com Bearer token, envelope padrão
 * { success, data } / { success: false, error }. Escrita (criar, editar,
 * apagar indicador e registrar medição) só CONSULTOR; EMPRESA só lê os da
 * própria empresa:
 *
 *   POST   /indicadores                     { empresa_id, nome, unidade, periodicidade, descricao?, meta? } -> Indicador
 *   GET    /indicadores?empresa_id=          empresa_id OBRIGATÓRIO -> Indicador[]
 *   GET    /indicadores/:id                  -> Indicador
 *   PUT    /indicadores/:id                  (parcial) -> Indicador
 *   DELETE /indicadores/:id                  -> 204 (cascata: apaga os valores também)
 *   POST   /indicadores/:id/valores           { valor, data_referencia, observacao? } -> IndicadorValor
 *   GET    /indicadores/:id/valores           -> IndicadorValor[]
 *
 * Não existe "listar indicadores de todas as empresas" — mesma limitação
 * de Diagnósticos/Planos de Ação (ver useIndicadoresQuery, que busca por
 * empresa e junta o resultado quando não há uma empresa específica
 * filtrada).
 */
const INDICADORES_PATH = "/indicadores";

export const indicadoresService = {
  async list(empresaId: string): Promise<Indicador[]> {
    const { items } = await httpService.list<Indicador>(INDICADORES_PATH, { empresa_id: empresaId });
    return items;
  },

  create: (input: CreateIndicadorInput) => httpService.create<Indicador, CreateIndicadorInput>(INDICADORES_PATH, input),

  getById: (id: string) => httpService.getById<Indicador>(INDICADORES_PATH, id),

  update: (id: string, input: UpdateIndicadorInput) =>
    httpService.update<Indicador, UpdateIndicadorInput>(INDICADORES_PATH, id, input),

  remove: (id: string) => httpService.remove(INDICADORES_PATH, id),

  async createValor(indicadorId: string, input: CreateIndicadorValorInput): Promise<IndicadorValor> {
    const response = await apiClient.post<ApiEnvelope<IndicadorValor>>(`${INDICADORES_PATH}/${indicadorId}/valores`, input);
    if (!response.data.data) throw new Error("Não foi possível registrar a medição.");
    return response.data.data;
  },

  async getValores(indicadorId: string): Promise<IndicadorValor[]> {
    const response = await apiClient.get<ApiEnvelope<IndicadorValor[]>>(`${INDICADORES_PATH}/${indicadorId}/valores`);
    return response.data.data ?? [];
  },
};
