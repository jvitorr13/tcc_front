import { httpService } from "@/services/http.service";

import type { CreateModeloInput, Modelo } from "@/features/questionario/types/modelo.types";

/**
 * Contrato de API (internal/questionario), só CONSULTOR:
 *
 *   POST /questionario/modelos   { nome, areas: [{ nome, descricao,
 *     perguntas: [{ texto, tipo, escala_min, escala_max, obrigatoria,
 *     peso }] }] }
 *     -> Modelo, já criado com a versão 1 (inativa) numa transação única.
 *        A ordem das áreas/perguntas é a posição na lista enviada.
 *        400 corpo inválido / área sem pergunta / pergunta inválida (a
 *        mensagem indica a posição: "área N, pergunta M: ..."); 409 já
 *        existe um modelo com este nome.
 *   GET  /questionario/modelos             -> Modelo[]
 *   GET  /questionario/modelos/:id         -> Modelo
 *
 * Não existe GET nem POST separados para área/pergunta — tudo nasce junto
 * na criação do modelo, por isso não há tela de edição (só criação — ver
 * getVersaoAtual em modelo.types.ts pra ler versão/status). Ativar uma
 * versão é um recurso separado — ver versoes.service.ts.
 */
const MODELOS_PATH = "/questionario/modelos";

export const modelosService = {
  async list(): Promise<Modelo[]> {
    const { items } = await httpService.list<Modelo>(MODELOS_PATH);
    return items;
  },

  create: (input: CreateModeloInput) => httpService.create<Modelo, CreateModeloInput>(MODELOS_PATH, input),

  getById: (id: string) => httpService.getById<Modelo>(MODELOS_PATH, id),
};
