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
  /** Assumido: valor já respondido, presente quando o consultor volta a um diagnóstico em andamento. */
  resposta_atual?: number | null;
}

export interface AreaComPerguntas {
  id: string;
  nome: string;
  ordem: number;
  perguntas: Pergunta[];
}

export interface RegistrarRespostaInput {
  pergunta_id: string;
  valor: number;
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
