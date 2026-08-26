import { httpService } from "@/services/http.service";

import type { Modelo } from "@/features/questionario/types/modelo.types";

/**
 * Contrato de API (internal/questionario), hoje sem Authorization exigido
 * pelo backend (o apiClient manda o Bearer token de qualquer forma quando
 * existir, então nada muda no front quando isso for plugado):
 *
 *   POST /questionario/modelos            { nome, versao } -> Modelo
 *   GET  /questionario/modelos             -> Modelo[]
 *   GET  /questionario/modelos/:id         -> Modelo
 *   POST /questionario/areas               { modelo_id, nome, ordem } -> Area
 *   POST /questionario/perguntas           { area_id, texto, tipo, escala_min, escala_max, obrigatoria, peso } -> Pergunta
 *   POST /questionario/modelos/:id/ativar  -> Modelo
 *
 * Só `list` está implementado por enquanto — é o que o cadastro de
 * diagnóstico precisa pra popular o seletor de modelo. A tela de
 * configuração (criar modelo, áreas, perguntas, ativar) é a próxima etapa;
 * quando ela entrar, os demais métodos acima entram aqui também.
 */
const MODELOS_PATH = "/questionario/modelos";

export const modelosService = {
  async list(): Promise<Modelo[]> {
    const { items } = await httpService.list<Modelo>(MODELOS_PATH);
    return items;
  },
};
