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
 * Body de POST /questionario/modelos/:id/versoes: a árvore inteira da
 * versão nova (mesmo formato de `areas` da criação do modelo). Versão salva
 * nunca muda — editar = salvar uma versão nova.
 */
export interface CreateVersaoInput {
  areas: CreateAreaInput[];
}

/**
 * "A versão atual" de um modelo é a de numero_versao mais alto — a mais
 * recente, criada na criação do modelo (v1) ou em "Nova versão". Não é
 * necessariamente a ativa: uma versão nova nasce inativa até ser ativada.
 */
export function getVersaoAtual(modelo: Pick<Modelo, "versoes">): ModeloVersao | undefined {
  return [...modelo.versoes].sort((a, b) => b.numero_versao - a.numero_versao)[0];
}

/**
 * Diagnóstico guarda a VERSÃO aplicada (modelo_versao_id), não o modelo —
 * acha o modelo dono dessa versão e devolve "Nome — vN" pra exibir.
 */
export function getModeloNomeDaVersao(modelos: Modelo[], versaoId: string): string | undefined {
  for (const modelo of modelos) {
    const versao = modelo.versoes.find((item) => item.id === versaoId);
    if (versao) return `${modelo.nome} — v${versao.numero_versao}`;
  }
  return undefined;
}
