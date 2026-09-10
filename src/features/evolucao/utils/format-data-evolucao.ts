/**
 * `data_finalizacao`/`variacao_desde` chegam como "YYYY-MM-DD" puro, sem
 * horário/timezone — diferente de outros timestamps do sistema (RFC3339).
 * NUNCA usar `new Date(iso)` + `toLocaleDateString` aqui: num fuso atrás de
 * UTC (ex: America/Sao_Paulo, -03:00, o fuso alvo deste app) isso volta um
 * dia a menos. Só manipulação de string, sem Date.
 */
export function formatDataEvolucao(value: string | null | undefined): string {
  if (!value) return "—";
  const [year, month, day] = value.split("-");
  if (!year || !month || !day) return "—";
  return `${day}/${month}/${year}`;
}
