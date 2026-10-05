import type { Area, CreateAreaInput } from "@/features/questionario/types/area.types";

/**
 * Modelo de questionário de diagnóstico (internal/questionario). POST
 * /questionario/modelos cria o modelo já com a versão 1 (áreas e perguntas
 * inclusas) numa transação única — por isso a versão vive aninhada em
 * `versoes`, não como campos soltos no modelo.
 */
export interface ModeloVersao {
  id: string;
  modelo_id: string;
  numero_versao: number;
  /** Versão nasce inativa; fica ativa via POST /questionario/modelos/:id/ativar. */
  ativo: boolean;
  created_at: string;
  areas: Area[];
}

export interface Modelo {
  id: string;
  nome: string;
  created_at: string;
  updated_at: string;
  versoes: ModeloVersao[];
}

export interface CreateModeloInput {
  nome: string;
  areas: CreateAreaInput[];
}

/**
 * Hoje todo modelo nasce com exatamente uma versão (a criação já cria a v1
 * junto) e não existe endpoint pra criar uma versão nova — por isso "a
 * versão atual" é sempre a de numero_versao mais alto. Continua correto se
 * um fluxo de nova versão for adicionado depois.
 */
export function getVersaoAtual(modelo: Pick<Modelo, "versoes">): ModeloVersao | undefined {
  return [...modelo.versoes].sort((a, b) => b.numero_versao - a.numero_versao)[0];
}
