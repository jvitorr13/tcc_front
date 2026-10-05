/**
 * Tipos do domínio de diagnóstico (internal/diagnostico). Espelham o fluxo
 * combinado com o backend: criar -> iniciar -> responder -> finalizar ->
 * calcular resultado -> histórico.
 */
export type DiagnosticoStatus = "RASCUNHO" | "EM_ANDAMENTO" | "CONCLUIDO";

export interface Diagnostico {
  id: string;
  empresa_id: string;
  consultor_id: string;
  modelo_id: string;
  nome: string;
  descricao: string;
  status: DiagnosticoStatus;
  data_inicio: string | null;
  data_conclusao: string | null;
  created_at: string;
  updated_at: string;
  /**
   * Assumido: quando CONCLUIDO, o backend denormaliza o resultado calculado
   * no próprio registro do diagnóstico — evita N+1 (buscar o resultado de
   * cada linha da listagem só pra mostrar a coluna Maturidade). Se o
   * backend não preencher isso, a coluna cai graciosamente para "—"
   * (ver DiagnosticosTable) em vez de quebrar.
   */
  nivel_maturidade?: string | null;
  media_geral?: number | null;
}

export interface CreateDiagnosticoInput {
  empresa_id: string;
  consultor_id: string;
  modelo_id: string;
  nome: string;
  descricao?: string;
}

export interface DiagnosticosFilters {
  empresa_id?: string;
  status?: DiagnosticoStatus;
}

/**
 * Shape de GET /diagnosticos/:id/perguntas, /pendencias e do payload de
 * POST /diagnosticos/:id/respostas — não documentado campo a campo na
 * conversa com o backend, só descrito conceitualmente ("perguntas
 * organizadas por área", "quantas perguntas obrigatórias faltam"). Ajustar
 * aqui se a resposta real do backend divergir.
 */
export interface Pergunta {
  id: string;
  texto: string;
  tipo: string;
  escala_min: number;
  escala_max: number;
  obrigatoria: boolean;
  peso: number;
  /**
   * Valor já respondido, presente quando se volta a um diagnóstico em
   * andamento. Vem como string (igual ao campo `valor` de POST/GET
   * /respostas — a API usa string pra "valor" sempre, independente do
   * tipo da pergunta); converter pra número ao semear o estado local, que
   * é numérico pra casar com a escala Likert (ver DiagnosticoDetalhePage).
   */
  resposta_atual?: string | null;
}

export interface AreaComPerguntas {
  id: string;
  nome: string;
  ordem: number;
  perguntas: Pergunta[];
}

/**
 * `valor` é sempre string na API, pra qualquer tipo de pergunta (ESCALA,
 * SIM_NAO, MULTIPLA_ESCOLHA, TEXTO) — mandar número sem aspas (`3` em vez
 * de `"3"`) faz a API recusar o corpo inteiro com 400 "corpo da
 * requisição inválido". Ver diagnosticosService.responder.
 */
export interface RegistrarRespostaInput {
  pergunta_id: string;
  valor: string;
}

export interface Pendencias {
  quantidade: number;
}

export interface ResultadoPorArea {
  area_id: string;
  area_nome: string;
  media: number;
}

export interface ResultadoDiagnostico {
  media_geral: number;
  nivel_maturidade: string;
  por_area: ResultadoPorArea[];
}
