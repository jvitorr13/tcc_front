import type { NivelMaturidade } from "@/features/evolucao/types/evolucao.types";
import type { PerguntaOpcao } from "@/features/questionario/types/pergunta.types";

/**
 * Tipos do domínio de diagnóstico (internal/diagnostico). Ciclo de status
 * (o front nunca envia status — ele muda sozinho conforme as chamadas):
 * RASCUNHO -(consultor: iniciar)-> PENDENTE -(1ª resposta)-> EM_ANDAMENTO
 * -(empresa: finalizar)-> CONCLUIDO. A EMPRESA não enxerga RASCUNHO.
 */
export type DiagnosticoStatus = "RASCUNHO" | "PENDENTE" | "EM_ANDAMENTO" | "CONCLUIDO";

export interface Diagnostico {
  id: string;
  empresa_id: string;
  consultor_id: string;
  /** Versão do modelo aplicada (não o modelo) — ver getModeloNomeDaVersao. */
  modelo_versao_id: string;
  nome: string;
  descricao: string;
  status: DiagnosticoStatus;
  data_inicio: string | null;
  data_conclusao: string | null;
  created_at: string;
  updated_at: string;
  /**
   * Não documentado — a API não devolve o resultado na listagem. Mantido
   * opcional: se algum dia vier, a coluna Maturidade de DiagnosticosTable
   * passa a mostrar; senão cai em "—".
   */
  nivel_maturidade?: string | null;
  media_geral?: number | null;
}

/**
 * Body de POST /diagnosticos segundo o Swagger: só empresa_id + nome. O
 * consultor é o usuário do token e o modelo é a versão ativa no momento —
 * nenhum dos dois é escolhido pelo front.
 */
export interface CreateDiagnosticoInput {
  empresa_id: string;
  nome: string;
}

export interface DiagnosticosFilters {
  empresa_id?: string;
  status?: DiagnosticoStatus;
}

export type TipoPergunta = "ESCALA" | "SIM_NAO" | "MULTIPLA_ESCOLHA" | "TEXTO";

/**
 * Pergunta como vem em GET /diagnosticos/:id/perguntas e em cada item de
 * GET /diagnosticos/:id/pendencias (a API devolve a LISTA das obrigatórias
 * sem resposta, no mesmo formato — não um contador).
 */
export interface Pergunta {
  id: string;
  area_id: string;
  texto: string;
  tipo: TipoPergunta;
  /** Só em ESCALA; null nos outros tipos. */
  escala_min: number | null;
  escala_max: number | null;
  obrigatoria: boolean;
  /** Só entra no cálculo do resultado; o front não exibe. */
  peso: number;
  ordem: number;
  /**
   * Descrição de cada nível (perguntas ESCALA) — o que a empresa lê pra
   * escolher. A tela monta os níveis de escala_min a escala_max e casa a
   * descrição pelo `valor`; nível sem descrição (só em dado antigo) mostra
   * só o número. A resposta enviada é sempre o número do nível.
   */
  opcoes: PerguntaOpcao[];
}

/** Item cru de GET /diagnosticos/:id/perguntas: `{ area, perguntas }`. */
export interface PerguntasDaAreaResponse {
  area: { id: string; nome: string; descricao: string; ordem: number };
  perguntas: Pergunta[];
}

/**
 * Formato achatado que a tela usa (o service converte de
 * PerguntasDaAreaResponse) — área + suas perguntas, na ordem de exibição.
 */
export interface AreaComPerguntas {
  id: string;
  nome: string;
  descricao: string;
  ordem: number;
  perguntas: Pergunta[];
}

/**
 * `valor` é SEMPRE string, pra qualquer tipo: ESCALA = a nota ("4", nunca
 * 4), SIM_NAO = "SIM" | "NAO", MULTIPLA_ESCOLHA/TEXTO = texto livre. "" só
 * é aceito em pergunta não obrigatória (limpa a resposta). Reenviar pra
 * mesma pergunta substitui a resposta anterior.
 */
export interface RegistrarRespostaInput {
  pergunta_id: string;
  valor: string;
}

/** Item de GET /diagnosticos/:id/respostas e retorno de POST .../respostas. */
export interface Resposta {
  id: string;
  diagnostico_id: string;
  pergunta_id: string;
  valor: string;
  created_at: string;
  updated_at: string;
}

export interface ResultadoPorArea {
  area_id: string;
  area_nome: string;
  media: number;
}

/** POST (calcula e grava) e GET (já gravado) /diagnosticos/:id/resultado. */
export interface ResultadoDiagnostico {
  diagnostico_id: string;
  media_geral: number;
  nivel_maturidade: NivelMaturidade;
  data_calculo: string;
  areas: ResultadoPorArea[];
}
