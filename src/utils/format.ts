/** Formata uma data ISO (ex: "2026-01-01T00:00:00Z") como "dd/mm/aaaa". Retorna "—" se vazia/inválida. */
export function formatDate(iso: string | null | undefined): string {
  if (!iso) return "—";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("pt-BR");
}

/**
 * Data sem hora (prazo de tarefa) como "dd/mm/aaaa". Usa só os 10 primeiros
 * caracteres — aceita "2026-10-20" e "2026-10-20T00:00:00Z" — e nunca passa
 * por new Date(): meia-noite UTC viraria o dia anterior em UTC-3.
 */
export function formatDateOnly(value: string | null | undefined): string {
  const match = value?.slice(0, 10).match(/^(\d{4})-(\d{2})-(\d{2})$/);
  return match ? `${match[3]}/${match[2]}/${match[1]}` : "—";
}

/** Formata um número com vírgula decimal, padrão pt-BR (ex: 3.625 -> "3,63"). */
export function formatDecimal(value: number | null | undefined, digits = 2): string {
  if (value === null || value === undefined) return "—";
  return value.toLocaleString("pt-BR", { minimumFractionDigits: digits, maximumFractionDigits: digits });
}

/** Formata uma data ISO como "dd/mm/aaaa hh:mm" (horário local). Retorna "—" se vazia/inválida. */
export function formatDateTime(iso: string | null | undefined): string {
  if (!iso) return "—";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "—";
  const data = date.toLocaleDateString("pt-BR");
  const hora = date.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
  return `${data} ${hora}`;
}
