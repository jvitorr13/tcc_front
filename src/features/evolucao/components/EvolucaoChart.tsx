import { formatDecimal } from "@/utils/format";

import { MaturidadeBadge } from "@/features/evolucao/components/MaturidadeBadge";
import { NIVEL_MATURIDADE_DOT_CLASSES } from "@/features/evolucao/constants/maturidade";
import { formatDataEvolucao } from "@/features/evolucao/utils/format-data-evolucao";
import type { EvolucaoDiagnostico } from "@/features/evolucao/types/evolucao.types";

export interface EvolucaoChartProps {
  diagnosticos: EvolucaoDiagnostico[];
}

const WIDTH = 640;
const HEIGHT = 180;
const PADDING = { top: 20, right: 20, bottom: 20, left: 20 };

/**
 * Gráfico de linha em SVG puro (mesmo approach do gráfico de indicadores —
 * sem lib nova). Assume diagnosticos já ordenado por data_finalizacao
 * ascendente (garantido pelo back-end, nunca reordenado aqui). Com 1 item
 * só, desenha o ponto único, sem linha. Cada ponto usa a cor do
 * nivel_maturidade daquele diagnóstico específico (mapa fixo, ver
 * constants/maturidade.ts) — não é sequencial nem por posição.
 */
export function EvolucaoChart({ diagnosticos }: EvolucaoChartProps) {
  const values = diagnosticos.map((item) => item.media_geral);
  const minValue = Math.min(...values);
  const maxValue = Math.max(...values);
  const range = maxValue - minValue || 1;

  const innerWidth = WIDTH - PADDING.left - PADDING.right;
  const innerHeight = HEIGHT - PADDING.top - PADDING.bottom;

  function xFor(index: number): number {
    if (diagnosticos.length === 1) return PADDING.left + innerWidth / 2;
    return PADDING.left + (index / (diagnosticos.length - 1)) * innerWidth;
  }

  function yFor(value: number): number {
    return PADDING.top + innerHeight - ((value - minValue) / range) * innerHeight;
  }

  const points = diagnosticos.map((item, index) => `${xFor(index)},${yFor(item.media_geral)}`).join(" ");

  return (
    <div>
      <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} className="h-auto w-full" role="img" aria-label="Evolução da média geral">
        {diagnosticos.length > 1 && (
          <polyline
            points={points}
            fill="none"
            className="text-ink-900"
            stroke="currentColor"
            strokeWidth={2.5}
            strokeLinejoin="round"
            strokeLinecap="round"
          />
        )}
        {diagnosticos.map((item, index) => (
          <circle
            key={item.diagnostico_id}
            cx={xFor(index)}
            cy={yFor(item.media_geral)}
            r={5.5}
            className={NIVEL_MATURIDADE_DOT_CLASSES[item.nivel_maturidade]}
          />
        ))}
      </svg>

      <div className="mt-4 flex flex-wrap justify-between gap-4">
        {diagnosticos.map((item) => (
          <div key={item.diagnostico_id}>
            <p className="text-xs text-ink-500">{formatDataEvolucao(item.data_finalizacao)}</p>
            <div className="mt-1 flex items-center gap-2">
              <p className="font-display text-xl text-ink-900">{formatDecimal(item.media_geral)}</p>
              <MaturidadeBadge nivel={item.nivel_maturidade} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
