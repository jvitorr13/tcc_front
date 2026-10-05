import type { CreatePerguntaInput, PerguntaConfig } from "@/features/questionario/types/pergunta.types";

/**
 * Área dentro de uma versão de modelo — sempre aninhada (não existe GET nem
 * POST /questionario/areas separado: tudo nasce junto em POST
 * /questionario/modelos, ver modelos.service.ts).
 */
export interface Area {
  id: string;
  nome: string;
  descricao: string;
  ordem: number;
  perguntas: PerguntaConfig[];
}

/** Sem `ordem`: a posição na lista enviada é que define a ordem (ver doc do endpoint). */
export interface CreateAreaInput {
  nome: string;
  descricao: string;
  perguntas: CreatePerguntaInput[];
}
