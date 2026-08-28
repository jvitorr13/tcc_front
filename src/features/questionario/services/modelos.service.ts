import { apiClient } from "@/lib/api-client";
import { httpService } from "@/services/http.service";
import type { ApiEnvelope } from "@/types/api";

import type { CreateModeloInput, Modelo } from "@/features/questionario/types/modelo.types";

/**
 * Contrato de API (internal/questionario), hoje sem Authorization exigido
 * pelo backend (o apiClient manda o Bearer token de qualquer forma quando
 * existir, então nada muda no front quando isso for plugado):
 *
 *   POST /questionario/modelos            { nome, versao } -> Modelo
 *   GET  /questionario/modelos             -> Modelo[]
 *   GET  /questionario/modelos/:id         -> Modelo
 *   POST /questionario/modelos/:id/ativar  -> Modelo
 *
 * Ver areas.service.ts e perguntas.service.ts para os demais endpoints
 * deste domínio (POST /questionario/areas, POST /questionario/perguntas).
 * Não existe GET para áreas/perguntas de um modelo — por isso não há tela
 * de edição de modelo, só criação (ver CreateModeloPage).
 */
const MODELOS_PATH = "/questionario/modelos";

export const modelosService = {
  async list(): Promise<Modelo[]> {
    const { items } = await httpService.list<Modelo>(MODELOS_PATH);
    return items;
  },

  create: (input: CreateModeloInput) => httpService.create<Modelo, CreateModeloInput>(MODELOS_PATH, input),

  getById: (id: string) => httpService.getById<Modelo>(MODELOS_PATH, id),

  async ativar(id: string): Promise<Modelo> {
    const response = await apiClient.post<ApiEnvelope<Modelo>>(`${MODELOS_PATH}/${id}/ativar`);
    if (!response.data.data) throw new Error("Não foi possível ativar o modelo.");
    return response.data.data;
  },
};
