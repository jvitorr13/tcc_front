/**
 * Espelha o Indicator/IndicatorValue do backend (internal/indicador — rotas
 * /indicadores, sem autenticação). `situacao` já vem calculada em toda
 * resposta (SEM_DADOS/SEM_META/META_ATINGIDA/ABAIXO_DA_META) — nunca
 * recalculada aqui; `valor_atual` idem, é sempre o valor do IndicatorValue
 * de data_referencia mais recente, também nunca calculado no front.
 */
export type IndicadorPeriodicidade = "MENSAL" | "TRIMESTRAL" | "SEMESTRAL" | "ANUAL";
export type IndicadorSituacao = "SEM_DADOS" | "SEM_META" | "META_ATINGIDA" | "ABAIXO_DA_META";

export interface Indicador {
  id: string;
  empresa_id: string;
  nome: string;
  descricao: string;
  unidade: string;
  meta: number | null;
  valor_atual: number | null;
  periodicidade: IndicadorPeriodicidade;
  situacao: IndicadorSituacao;
  created_at: string;
  updated_at: string;
}

export interface CreateIndicadorInput {
  empresa_id: string;
  nome: string;
  descricao?: string;
  unidade: string;
  meta?: number;
  periodicidade: IndicadorPeriodicidade;
}

/** PUT /indicadores/:id — todos os campos opcionais, só o que muda é enviado. */
export interface UpdateIndicadorInput {
  nome?: string;
  descricao?: string;
  unidade?: string;
  meta?: number;
  periodicidade?: IndicadorPeriodicidade;
}

export interface IndicadorValor {
  id: string;
  indicador_id: string;
  valor: number;
  /** Volta como timestamp RFC3339; ao enviar (criar) é só AAAA-MM-DD. */
  data_referencia: string;
  observacao: string;
  created_at: string;
}

export interface CreateIndicadorValorInput {
  valor: number;
  /** AAAA-MM-DD. */
  data_referencia: string;
  observacao?: string;
}
