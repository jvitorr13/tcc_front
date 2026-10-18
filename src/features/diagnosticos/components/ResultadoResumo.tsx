import { Card } from "@/components/ui/Card";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { cn } from "@/utils/cn";
import { formatDecimal } from "@/utils/format";

import { MaturidadeBadge } from "@/features/evolucao/components/MaturidadeBadge";
import {
  getNivelMaturidade,
  NIVEIS_MATURIDADE,
  nivelPorMedia,
  TOTAL_NIVEIS_MATURIDADE,
} from "@/features/evolucao/constants/maturidade";

import type { ResultadoDiagnostico } from "@/features/diagnosticos/types/diagnostico.types";

export interface ResultadoResumoProps {
  resultado: ResultadoDiagnostico;
}

/** Médias vão de 1,00 a 5,00 (escala do Quadro 3). Só afeta o comprimento da barra de cada área. */
const MEDIA_MAXIMA = 5;

const ESCALA = Object.values(NIVEIS_MATURIDADE).sort((a, b) => a.nivel - b.nivel);

/**
 * Resultado do diagnóstico. O nível GERAL é o `nivel_maturidade` que a API
 * devolveu — nunca recalculado a partir de media_geral (ver
 * NIVEIS_MATURIDADE). Exibição: "Nível 3 - Padronizado", a média com duas
 * casas ("Média 3,40 de 5,00") e uma escala de 5 passos marcada até o
 * nível. A média de cada área vem sem nível: aí sim usa nivelPorMedia,
 * com a mesma tabela.
 */
export function ResultadoResumo({ resultado }: ResultadoResumoProps) {
  const info = getNivelMaturidade(resultado.nivel_maturidade);

  return (
    <div className="space-y-6">
      <Card className="p-6 sm:p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-ink-500">Nível de maturidade</p>

        <div className="mt-3 flex flex-wrap items-end justify-between gap-x-6 gap-y-2">
          <p className="font-display text-3xl text-ink-900">
            {info ? `Nível ${info.nivel} - ${info.label}` : resultado.nivel_maturidade}
          </p>
          <p className="text-sm text-ink-600">
            Média <span className="font-semibold tabular-nums text-ink-900">{formatDecimal(resultado.media_geral)}</span>{" "}
            de {formatDecimal(MEDIA_MAXIMA)}
          </p>
        </div>

        {/* Escala de 5 passos: marca do 1 até o nível. */}
        <ol className="mt-6 grid grid-cols-5 gap-1.5" aria-label={`Nível ${info?.nivel ?? "?"} de ${TOTAL_NIVEIS_MATURIDADE}`}>
          {ESCALA.map((passo) => {
            const marcado = info ? passo.nivel <= info.nivel : false;
            const atual = info?.nivel === passo.nivel;
            return (
              <li key={passo.nivel} aria-current={atual ? "step" : undefined}>
                <span
                  aria-hidden
                  className={cn("block h-2 rounded-full", marcado ? "bg-ink-900" : "bg-ink-900/10")}
                />
                <p className={cn("mt-2 text-xs", atual ? "font-semibold text-ink-900" : "text-ink-500")}>
                  <span className="tabular-nums">{passo.nivel}</span> · {passo.label}
                </p>
                <p className="text-[11px] tabular-nums text-ink-400">{passo.faixa}</p>
              </li>
            );
          })}
        </ol>
      </Card>

      <Card className="p-6">
        <h2 className="font-display text-lg text-ink-900">Resultado por área</h2>
        <div className="mt-4 space-y-4">
          {resultado.areas.map((area) => (
            <div key={area.area_id}>
              <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
                <span className="text-ink-700">{area.area_nome}</span>
                <span className="flex items-center gap-2">
                  <MaturidadeBadge nivel={nivelPorMedia(area.media)} />
                  <span className="font-medium tabular-nums text-ink-900">{formatDecimal(area.media)}</span>
                </span>
              </div>
              <ProgressBar value={(area.media / MEDIA_MAXIMA) * 100} className="mt-1.5" label={area.area_nome} />
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
