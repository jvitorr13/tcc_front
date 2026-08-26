/** Formata uma data ISO (ex: "2026-01-01T00:00:00Z") como "dd/mm/aaaa". Retorna "—" se vazia/inválida. */
export function formatDate(iso: string | null | undefined): string {
  if (!iso) return "—";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("pt-BR");
}

/** Formata um número com vírgula decimal, padrão pt-BR (ex: 3.625 -> "3,63"). */
export function formatDecimal(value: number | null | undefined, digits = 2): string {
  if (value === null || value === undefined) return "—";
  return value.toLocaleString("pt-BR", { minimumFractionDigits: digits, maximumFractionDigits: digits });
}
