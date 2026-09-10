/**
 * Espelha a resposta de GET /empresas/:id/evolucao. Nada aqui é recalculado
 * no front — só leitura do que o back-end já persistiu (médias, nível de
 * maturidade, variação). `diagnostico_id` é string (não numérico).
 */
export type NivelMaturidade = "INICIAL" | "BASICO" | "ESTRUTURADO" | "GERENCIADO" | "OTIMIZADO";

export interface EvolucaoAreaMedia {
  nome: string;
  media: number;
}

export interface EvolucaoDiagnostico {
  diagnostico_id: string;
  nome: string;
  /** YYYY-MM-DD — sem timezone, não é RFC3339. Nunca passar por `new Date()`/formatDate. */
  data_finalizacao: string;
  media_geral: number;
  nivel_maturidade: NivelMaturidade;
  areas: EvolucaoAreaMedia[];
}

export interface EmpresaEvolucao {
  /** Ordenado por data_finalizacao ascendente — é o eixo X do gráfico. Só inclui diagnósticos CONCLUIDO com resultado já calculado. */
  diagnosticos: EvolucaoDiagnostico[];
  /** null quando há 0 ou 1 diagnóstico (nada para comparar ainda) — diferente de 0 (não mudou). */
  variacao_media_geral: number | null;
  /** YYYY-MM-DD, mesma observação de data_finalizacao. */
  variacao_desde: string | null;
}
