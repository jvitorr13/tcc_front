interface Ordenavel {
  id?: string | number;
  created_at?: string | null;
}

/**
 * Mais recente primeiro: por `created_at` (desc) e, sem data ou empatado,
 * pelo id numérico (desc — o id da API é sequencial). Não altera o array
 * original.
 */
export function ordenarMaisRecentes<T>(items: T[]): T[] {
  return [...items].sort((a, b) => {
    const x = a as Ordenavel;
    const y = b as Ordenavel;
    const dataX = x.created_at ? Date.parse(x.created_at) : NaN;
    const dataY = y.created_at ? Date.parse(y.created_at) : NaN;
    if (!Number.isNaN(dataX) && !Number.isNaN(dataY) && dataX !== dataY) return dataY - dataX;
    return Number(y.id ?? 0) - Number(x.id ?? 0) || 0;
  });
}
