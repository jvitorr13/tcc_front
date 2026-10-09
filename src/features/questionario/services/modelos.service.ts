import { httpService } from "@/services/http.service";

import type {
  CreateModeloInput,
  CreateVersaoInput,
  Modelo,
  ModeloVersao,
} from "@/features/questionario/types/modelo.types";

/**
 * Contrato de API (internal/questionario), só CONSULTOR:
 *
 *   POST /questionario/modelos   { nome, areas: [{ nome, descricao,
 *     perguntas: [{ texto, tipo, escala_min, escala_max, obrigatoria,
 *     peso, opcoes?: [{ valor, descricao }] }] }] }
 *     -> Modelo, já criado com a versão 1 (inativa) numa transação única.
 *        A ordem das áreas/perguntas é a posição na lista enviada.
 *        400 corpo inválido / área sem pergunta / pergunta ou opção
 *        inválida (a mensagem indica a posição: "área N, pergunta M: ..."
 *        ou "área N, pergunta M, opção K: ..." — ver parseErroPosicao);
 *        409 já existe um modelo com este nome.
 *   POST /questionario/modelos/:id/versoes  { areas: [...] } (mesma árvore,
 *     com opcoes) -> ModeloVersao nova (inativa), mesmos 400 de posição.
 *   GET  /questionario/modelos             -> Modelo[]
 *   GET  /questionario/modelos/:id         -> Modelo
 *
 * Não existe GET nem POST separados para área/pergunta — a árvore inteira
 * vai junto. Versão salva nunca muda: "editar" um modelo é salvar uma
 * versão nova a partir de outra (o editor carrega GET
 * /questionario/versoes/:id e reenvia tudo, inclusive as opcoes — sem elas
 * a versão nova fica sem frases). Ler/ativar versão — ver versoes.service.ts.
 */
const MODELOS_PATH = "/questionario/modelos";

export const modelosService = {
  async list(): Promise<Modelo[]> {
    const { items } = await httpService.list<Modelo>(MODELOS_PATH);
    return items;
  },

  create: (input: CreateModeloInput) => httpService.create<Modelo, CreateModeloInput>(MODELOS_PATH, input),

  getById: (id: string) => httpService.getById<Modelo>(MODELOS_PATH, id),

  createVersao: (modeloId: string, input: CreateVersaoInput) =>
    httpService.create<ModeloVersao, CreateVersaoInput>(`${MODELOS_PATH}/${modeloId}/versoes`, input),
};
