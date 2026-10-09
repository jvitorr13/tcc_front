import { apiClient } from "@/lib/api-client";
import { httpService } from "@/services/http.service";
import type { ApiEnvelope } from "@/types/api";

import type {
  AreaComPerguntas,
  CreateDiagnosticoInput,
  Diagnostico,
  DiagnosticoStatus,
  Pergunta,
  PerguntasDaAreaResponse,
  RegistrarRespostaInput,
  Resposta,
  ResultadoDiagnostico,
} from "@/features/diagnosticos/types/diagnostico.types";

/**
 * Contrato de API (internal/diagnostico), conforme o Swagger. Todas as
 * rotas exigem Bearer token.
 *
 *   GET  /diagnosticos?empresa_id=           -> Diagnostico[] (empresa_id OBRIGATÓRIO; sem filtro de status
 *                                               na API — o filtro por status é feito aqui, client-side)
 *   POST /diagnosticos                       { empresa_id, nome } -> Diagnostico (só CONSULTOR; consultor = token,
 *                                               modelo = versão ativa)
 *   POST /diagnosticos/:id/iniciar            -> Diagnostico (RASCUNHO -> PENDENTE; só CONSULTOR)
 *   GET  /diagnosticos/:id/perguntas          -> { area, perguntas }[] (já na ordem; achatado em AreaComPerguntas)
 *   GET  /diagnosticos/:id/respostas          -> Resposta[] (respostas já gravadas)
 *   POST /diagnosticos/:id/respostas          { pergunta_id, valor } -> Resposta (upsert; valor é SEMPRE string;
 *                                               a 1ª resposta leva PENDENTE -> EM_ANDAMENTO; só EMPRESA)
 *   GET  /diagnosticos/:id/pendencias         -> Pergunta[] (obrigatórias ainda sem resposta)
 *   POST /diagnosticos/:id/finalizar          -> Diagnostico (EM_ANDAMENTO -> CONCLUIDO; só EMPRESA)
 *   POST /diagnosticos/:id/resultado          -> ResultadoDiagnostico (calcula; só EMPRESA)
 *   GET  /diagnosticos/:id/resultado          -> ResultadoDiagnostico (já calculado; 404 se ainda não)
 *
 * NÃO existe GET /diagnosticos/:id — não tem como buscar um diagnóstico
 * avulso por id. Por isso a tela de detalhe carrega o empresa_id na própria
 * URL (?empresa=) e acha o diagnóstico dentro da lista daquela empresa (ver
 * useDiagnosticoQuery).
 *
 * `list`/`create` usam httpService (shape genérico de CRUD). As ações
 * aninhadas ao diagnóstico chamam apiClient diretamente — não são um CRUD
 * simples.
 */
const DIAGNOSTICOS_PATH = "/diagnosticos";

export const diagnosticosService = {
  async list(empresaId: string, status?: DiagnosticoStatus): Promise<Diagnostico[]> {
    const { items } = await httpService.list<Diagnostico>(DIAGNOSTICOS_PATH, { empresa_id: empresaId });
    return status ? items.filter((item) => item.status === status) : items;
  },

  create: (input: CreateDiagnosticoInput) =>
    httpService.create<Diagnostico, CreateDiagnosticoInput>(DIAGNOSTICOS_PATH, input),

  async iniciar(id: string): Promise<Diagnostico> {
    const response = await apiClient.post<ApiEnvelope<Diagnostico>>(`${DIAGNOSTICOS_PATH}/${id}/iniciar`);
    if (!response.data.data) throw new Error("Não foi possível iniciar o diagnóstico.");
    return response.data.data;
  },

  /** A API devolve `{ area, perguntas }[]`; aqui vira o formato achatado que a tela usa. */
  async getPerguntas(id: string): Promise<AreaComPerguntas[]> {
    const response = await apiClient.get<ApiEnvelope<PerguntasDaAreaResponse[]>>(
      `${DIAGNOSTICOS_PATH}/${id}/perguntas`,
    );
    return (response.data.data ?? []).map(({ area, perguntas }) => ({
      id: area.id,
      nome: area.nome,
      descricao: area.descricao,
      ordem: area.ordem,
      perguntas: perguntas ?? [],
    }));
  },

  async getRespostas(id: string): Promise<Resposta[]> {
    const response = await apiClient.get<ApiEnvelope<Resposta[]>>(`${DIAGNOSTICOS_PATH}/${id}/respostas`);
    return response.data.data ?? [];
  },

  async responder(id: string, input: RegistrarRespostaInput): Promise<void> {
    await apiClient.post(`${DIAGNOSTICOS_PATH}/${id}/respostas`, input);
  },

  async getPendencias(id: string): Promise<Pergunta[]> {
    const response = await apiClient.get<ApiEnvelope<Pergunta[]>>(`${DIAGNOSTICOS_PATH}/${id}/pendencias`);
    return response.data.data ?? [];
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
