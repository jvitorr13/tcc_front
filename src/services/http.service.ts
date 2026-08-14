import { apiClient } from "@/lib/api-client";
import type { ApiEnvelope, ApiListEnvelope } from "@/types/api";

/**
 * Camada genérica sobre o apiClient para os PRÓXIMOS módulos (Empresas,
 * Diagnósticos, Perguntas, Respostas, Plano de Ação, Tarefas). Nenhum desses
 * módulos existe como feature ainda — isso é só a base compartilhada, para
 * quando `features/empresas/services/empresas.service.ts` (etc.) for criado,
 * ele já nascer sem duplicar a lógica de unwrap do envelope da API.
 *
 * Exemplo de uso futuro:
 *   export const empresasService = {
 *     list: () => httpService.list<Empresa>("/empresas"),
 *     getById: (id: string) => httpService.getById<Empresa>("/empresas", id),
 *   };
 */
export const httpService = {
  async list<T>(path: string, params?: Record<string, unknown>): Promise<{ items: T[]; meta: unknown }> {
    const response = await apiClient.get<ApiListEnvelope<T>>(path, { params });
    return { items: response.data.data ?? [], meta: response.data.meta };
  },

  async getById<T>(path: string, id: string): Promise<T> {
    const response = await apiClient.get<ApiEnvelope<T>>(`${path}/${id}`);
    if (!response.data.data) throw new Error("Recurso não encontrado.");
    return response.data.data;
  },

  async create<T, Payload = unknown>(path: string, payload: Payload): Promise<T> {
    const response = await apiClient.post<ApiEnvelope<T>>(path, payload);
    if (!response.data.data) throw new Error("Falha ao criar o recurso.");
    return response.data.data;
  },

  async update<T, Payload = unknown>(path: string, id: string, payload: Payload): Promise<T> {
    const response = await apiClient.put<ApiEnvelope<T>>(`${path}/${id}`, payload);
    if (!response.data.data) throw new Error("Falha ao atualizar o recurso.");
    return response.data.data;
  },

  async remove(path: string, id: string): Promise<void> {
    await apiClient.delete(`${path}/${id}`);
  },
};
