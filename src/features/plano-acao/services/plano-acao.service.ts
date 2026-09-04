import { apiClient } from "@/lib/api-client";
import { httpService } from "@/services/http.service";
import type { ApiEnvelope } from "@/types/api";

import type {
  CreatePlanoAcaoInput,
  CreateTarefaInput,
  PlanoAcao,
  PlanoAcaoComTarefas,
  PlanosAcaoFilters,
  Tarefa,
  UpdatePlanoAcaoInput,
  UpdateTarefaInput,
} from "@/features/plano-acao/types/plano-acao.types";

/**
 * Contrato de API (internal/plano-acao), envelope padrão
 * { success, data } / { success: false, error }:
 *
 *   POST   /planos-acao                                    { diagnostico_id, titulo, descricao } -> PlanoAcao
 *   GET    /planos-acao?empresa_id=&diagnostico_id=         -> PlanoAcao[]
 *   GET    /planos-acao/:id                                 -> PlanoAcao + tarefas: Tarefa[]
 *   PUT    /planos-acao/:id                                 { titulo?, descricao? } -> PlanoAcao (sem campo status)
 *   DELETE /planos-acao/:id                                 -> 204
 *   POST   /planos-acao/:id/tarefas                         { titulo, descricao?, responsavel, prazo?, prioridade } -> Tarefa
 *   GET    /planos-acao/:id/tarefas                         -> Tarefa[]
 *   PUT    /planos-acao/:id/tarefas/:tarefaId                { status?, observacao?, ... } -> Tarefa
 *   DELETE /planos-acao/:id/tarefas/:tarefaId                -> 204
 *
 * empresa_id/consultor_id do plano são herdados do diagnóstico pelo
 * back-end — nunca enviados no POST. Status do plano é sempre derivado das
 * tarefas; não existe endpoint pra editar isso.
 *
 * Único ponto de chamada HTTP deste domínio — telas/componentes não devem
 * chamar apiClient diretamente, sempre passar por aqui.
 */
const PLANOS_ACAO_PATH = "/planos-acao";

export const planoAcaoService = {
  async list(filters: PlanosAcaoFilters): Promise<PlanoAcao[]> {
    const { items } = await httpService.list<PlanoAcao>(PLANOS_ACAO_PATH, {
      empresa_id: filters.empresa_id,
      diagnostico_id: filters.diagnostico_id,
    });
    return items;
  },

  create: (input: CreatePlanoAcaoInput) => httpService.create<PlanoAcao, CreatePlanoAcaoInput>(PLANOS_ACAO_PATH, input),

  getById: (id: string) => httpService.getById<PlanoAcaoComTarefas>(PLANOS_ACAO_PATH, id),

  update: (id: string, input: UpdatePlanoAcaoInput) =>
    httpService.update<PlanoAcao, UpdatePlanoAcaoInput>(PLANOS_ACAO_PATH, id, input),

  remove: (id: string) => httpService.remove(PLANOS_ACAO_PATH, id),

  async createTarefa(planoId: string, input: CreateTarefaInput): Promise<Tarefa> {
    const response = await apiClient.post<ApiEnvelope<Tarefa>>(`${PLANOS_ACAO_PATH}/${planoId}/tarefas`, input);
    if (!response.data.data) throw new Error("Não foi possível criar a tarefa.");
    return response.data.data;
  },

  async getTarefas(planoId: string): Promise<Tarefa[]> {
    const response = await apiClient.get<ApiEnvelope<Tarefa[]>>(`${PLANOS_ACAO_PATH}/${planoId}/tarefas`);
    return response.data.data ?? [];
  },

  async updateTarefa(planoId: string, tarefaId: string, input: UpdateTarefaInput): Promise<Tarefa> {
    const response = await apiClient.put<ApiEnvelope<Tarefa>>(
      `${PLANOS_ACAO_PATH}/${planoId}/tarefas/${tarefaId}`,
      input,
    );
    if (!response.data.data) throw new Error("Não foi possível atualizar a tarefa.");
    return response.data.data;
  },

  async removeTarefa(planoId: string, tarefaId: string): Promise<void> {
    await apiClient.delete(`${PLANOS_ACAO_PATH}/${planoId}/tarefas/${tarefaId}`);
  },
};
