import type { IndicadorValor } from "@/features/indicadores/types/indicador.types";

export interface IndicadorEvolutionChartProps {
  valores: IndicadorValor[];
  meta: number | null;
}

const WIDTH = 640;
const HEIGHT = 200;
const PADDING = { top: 16, right: 12, bottom: 8, left: 12 };

function formatMesAno(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("pt-BR", { month: "short", year: "2-digit" }).replace(".", "");
}

/**
 * Gráfico de linha simples em SVG puro — sem biblioteca nova só pra um
 * sparkline. Nenhum valor é calculado aqui além de coordenadas de desenho;
 * os pontos (valor, data_referencia) e a meta vêm direto do back-end.
 */
export function IndicadorEvolutionChart({ valores, meta }: IndicadorEvolutionChartProps) {
  if (valores.length === 0) {
    return <p className="py-10 text-center text-sm text-ink-500">Nenhuma medição registrada ainda.</p>;
  }

  const sorted = [...valores].sort(
    (a, b) => new Date(a.data_referencia).getTime() - new Date(b.data_referencia).getTime(),
  );

  const numericValues = sorted.map((item) => item.valor);
  const allValues = meta != null ? [...numericValues, meta] : numericValues;
  const minValue = Math.min(...allValues);
  const maxValue = Math.max(...allValues);
  const range = maxValue - minValue || 1;

  const innerWidth = WIDTH - PADDING.left - PADDING.right;
  const innerHeight = HEIGHT - PADDING.top - PADDING.bottom;

  function xFor(index: number): number {
    if (sorted.length === 1) return PADDING.left + innerWidth / 2;
    return PADDING.left + (index / (sorted.length - 1)) * innerWidth;
  }

  function yFor(value: number): number {
    return PADDING.top + innerHeight - ((value - minValue) / range) * innerHeight;
  }

  const points = sorted.map((item, index) => `${xFor(index)},${yFor(item.valor)}`).join(" ");

  return (
    <div>
      <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} className="h-auto w-full" role="img" aria-label="Gráfico de evolução do indicador">
        {meta != null && (
          <line
            x1={PADDING.left}
            x2={WIDTH - PADDING.right}
            y1={yFor(meta)}
            y2={yFor(meta)}
            className="text-gold-500"
            stroke="currentColor"
            strokeWidth={1.5}
            strokeDasharray="5 4"
          />
        )}
        <polyline
          points={points}
          fill="none"
          className="text-ink-900"
          stroke="currentColor"
          strokeWidth={2.5}
          strokeLinejoin="round"
          strokeLinecap="round"
        />
        {sorted.map((item, index) => (
          <circle key={item.id} cx={xFor(index)} cy={yFor(item.valor)} r={4} className="fill-ink-900" />
        ))}
      </svg>

      <div className="mt-1 flex justify-between text-xs text-ink-500">
        {sorted.map((item) => (
          <span key={item.id}>{formatMesAno(item.data_referencia)}</span>
        ))}
      </div>
    </div>
  );
}
