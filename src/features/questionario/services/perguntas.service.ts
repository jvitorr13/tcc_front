import { httpService } from "@/services/http.service";

import type { CreatePerguntaInput, PerguntaConfig } from "@/features/questionario/types/pergunta.types";

/**
 * POST /questionario/perguntas { area_id, texto, tipo, escala_min,
 * escala_max, obrigatoria, peso } -> PerguntaConfig. Ver modelos.service.ts.
 */
const PERGUNTAS_PATH = "/questionario/perguntas";

export const perguntasService = {
  create: (input: CreatePerguntaInput) =>
    httpService.create<PerguntaConfig, CreatePerguntaInput>(PERGUNTAS_PATH, input),
};
