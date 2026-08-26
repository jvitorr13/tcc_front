import { apiClient } from "@/lib/api-client";
import { httpService } from "@/services/http.service";
import type { ApiEnvelope } from "@/types/api";

import type {
  AreaComPerguntas,
  CreateDiagnosticoInput,
  Diagnostico,
  DiagnosticoStatus,
  Pendencias,
  RegistrarRespostaInput,
  ResultadoDiagnostico,
} from "@/features/diagnosticos/types/diagnostico.types";

/**
 * Contrato de API (internal/diagnostico), hoje sem Authorization exigido
 * pelo backend (o apiClient manda o Bearer token de qualquer forma quando
 * existir, então nada muda no front quando isso for plugado):
 *
 *   GET  /diagnosticos?empresa_id=&status=  -> Diagnostico[] (empresa_id é OBRIGATÓRIO — confirmado: o backend
 *                                               responde 400 "empresa_id é obrigatório" sem ele. Não existe
 *                                               "listar tudo"; ver useDiagnosticosQuery, que busca por empresa
 *                                               e junta o resultado quando não há uma empresa específica filtrada.)
 *   POST /diagnosticos                       { empresa_id, consultor_id, modelo_id, nome, descricao } -> Diagnostico
 *   POST /diagnosticos/:id/iniciar            -> Diagnostico (RASCUNHO -> EM_ANDAMENTO)
 *   GET  /diagnosticos/:id/perguntas          -> AreaComPerguntas[] (perguntas do modelo, por área)
 *   POST /diagnosticos/:id/respostas          { pergunta_id, valor } -> void
 *   GET  /diagnosticos/:id/pendencias         -> Pendencias (quantas perguntas obrigatórias faltam)
 *   POST /diagnosticos/:id/finalizar          -> Diagnostico (EM_ANDAMENTO -> CONCLUIDO)
 *   POST /diagnosticos/:id/resultado          -> ResultadoDiagnostico (calcula)
 *   GET  /diagnosticos/:id/resultado          -> ResultadoDiagnostico (já calculado)
 *
 * NÃO existe GET /diagnosticos/:id (confirmado: 404) — não tem como buscar
 * um diagnóstico avulso por id. Por isso a tela de detalhe carrega o
 * empresa_id na própria URL (?empresa=) e acha o diagnóstico dentro da
 * lista daquela empresa (ver useDiagnosticoQuery).
 *
 * `list`/`create` usam httpService (shape genérico de CRUD). As ações
 * aninhadas ao diagnóstico (iniciar, perguntas, respostas, pendências,
 * finalizar, resultado) chamam apiClient diretamente, seguindo o mesmo
 * padrão de authService.login — não são um CRUD simples.
 */
const DIAGNOSTICOS_PATH = "/diagnosticos";

export const diagnosticosService = {
  async list(empresaId: string, status?: DiagnosticoStatus): Promise<Diagnostico[]> {
    const { items } = await httpService.list<Diagnostico>(DIAGNOSTICOS_PATH, {
      empresa_id: empresaId,
      status,
    });
    return items;
  },

  create: (input: CreateDiagnosticoInput) =>
    httpService.create<Diagnostico, CreateDiagnosticoInput>(DIAGNOSTICOS_PATH, input),

  async iniciar(id: string): Promise<Diagnostico> {
    const response = await apiClient.post<ApiEnvelope<Diagnostico>>(`${DIAGNOSTICOS_PATH}/${id}/iniciar`);
    if (!response.data.data) throw new Error("Não foi possível iniciar o diagnóstico.");
    return response.data.data;
  },

  async getPerguntas(id: string): Promise<AreaComPerguntas[]> {
    const response = await apiClient.get<ApiEnvelope<AreaComPerguntas[]>>(`${DIAGNOSTICOS_PATH}/${id}/perguntas`);
    return response.data.data ?? [];
  },

  async responder(id: string, input: RegistrarRespostaInput): Promise<void> {
    await apiClient.post(`${DIAGNOSTICOS_PATH}/${id}/respostas`, input);
  },

  async getPendencias(id: string): Promise<Pendencias> {
    const response = await apiClient.get<ApiEnvelope<Pendencias>>(`${DIAGNOSTICOS_PATH}/${id}/pendencias`);
    return response.data.data ?? { quantidade: 0 };
  },

  async finalizar(id: string): Promise<Diagnostico> {
    const response = await apiClient.post<ApiEnvelope<Diagnostico>>(`${DIAGNOSTICOS_PATH}/${id}/finalizar`);
    if (!response.data.data) throw new Error("Não foi possível finalizar o diagnóstico.");
    return response.data.data;
  },

  async calcularResultado(id: string): Promise<ResultadoDiagnostico> {
    const response = await apiClient.post<ApiEnvelope<ResultadoDiagnostico>>(
      `${DIAGNOSTICOS_PATH}/${id}/resultado`,
    );
    if (!response.data.data) throw new Error("Não foi possível calcular o resultado.");
    return response.data.data;
  },

  async getResultado(id: string): Promise<ResultadoDiagnostico> {
    const response = await apiClient.get<ApiEnvelope<ResultadoDiagnostico>>(`${DIAGNOSTICOS_PATH}/${id}/resultado`);
    if (!response.data.data) throw new Error("Resultado ainda não calculado.");
    return response.data.data;
  },
};
