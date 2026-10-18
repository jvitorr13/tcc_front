import { apiClient } from "@/lib/api-client";
import { httpService } from "@/services/http.service";
import type { ApiEnvelope, ApiPagination } from "@/types/api";

import type {
  Apontamento,
  ApontamentosFilters,
  CreateApontamentoInput,
  UpdateApontamentoInput,
} from "@/features/apontamentos/types/apontamento.types";

/**
 * Contrato de API (módulo apontamentos), todas com Bearer token:
 *
 *   POST   /empresas/{id}/apontamentos   { texto, visibilidade?, diagnostico_id?, tarefa_id? } -> 201 Apontamento
 *                                         (só CONSULTOR; {id} = empresa)
 *   GET    /empresas/{id}/apontamentos   ?page=&page_size=&diagnostico_id=&tarefa_id= -> Apontamento[] + meta
 *                                         (paginada como /users, do mais recente pro mais antigo;
 *                                         CONSULTOR vê tudo, EMPRESA só os "EMPRESA" da própria — o
 *                                         filtro é do back-end, o front não filtra nada)
 *   PUT    /apontamentos/{id}            { texto?, visibilidade? } -> Apontamento (só CONSULTOR; vínculos não mudam)
 *   DELETE /apontamentos/{id}            -> 204 (só CONSULTOR)
 *
 * Erros vêm em português no envelope (`error`) — a tela só repassa via
 * getErrorMessage.
 */
export const apontamentosService = {
  async list(
    empresaId: string,
    filters: ApontamentosFilters = {},
  ): Promise<{ items: Apontamento[]; meta: ApiPagination | undefined }> {
    const { items, meta } = await httpService.list<Apontamento>(`/empresas/${empresaId}/apontamentos`, {
      page: filters.page,
      page_size: filters.page_size,
      diagnostico_id: filters.diagnostico_id || undefined,
      tarefa_id: filters.tarefa_id || undefined,
    });
    return { items, meta: meta as ApiPagination | undefined };
  },

  create: (empresaId: string, input: CreateApontamentoInput) =>
    httpService.create<Apontamento, CreateApontamentoInput>(`/empresas/${empresaId}/apontamentos`, input),

  async update(id: string, input: UpdateApontamentoInput): Promise<Apontamento> {
    const response = await apiClient.put<ApiEnvelope<Apontamento>>(`/apontamentos/${id}`, input);
    if (!response.data.data) throw new Error("Não foi possível atualizar o apontamento.");
    return response.data.data;
  },

  remove: (id: string) => httpService.remove("/apontamentos", id),
};
