import { Badge } from "@/components/ui/Badge";
import { cn } from "@/utils/cn";

import { getNivelMaturidade, NIVEL_MATURIDADE_CLASSES } from "@/features/evolucao/constants/maturidade";
import type { NivelMaturidade } from "@/features/evolucao/types/evolucao.types";

export interface MaturidadeBadgeProps {
  /** Código vindo da API (INICIAL, GERENCIADO, PADRONIZADO, PREVISIVEL, OTIMIZADO). */
  nivel: NivelMaturidade | string;
  /** Mostra "Nível 3 - Padronizado" em vez de só "Padronizado". */
  comNumero?: boolean;
  className?: string;
}

/**
 * Badge do nível de maturidade — não usa as variantes genéricas do Badge
 * (só cobrem 4 cores) porque são 5 estados fixos com uma escala própria; o
 * className aqui sobrepõe o bg/text de "neutral" via tailwind-merge (Badge
 * já mescla className internamente com cn()). Código que o front não
 * conhece aparece cru, em cinza, em vez de um selo vazio.
 */
export function MaturidadeBadge({ nivel, comNumero, className }: MaturidadeBadgeProps) {
  const info = getNivelMaturidade(nivel);
  return (
    <Badge variant="neutral" className={cn(info && NIVEL_MATURIDADE_CLASSES[nivel as NivelMaturidade], className)}>
      {info ? (comNumero ? `Nível ${info.nivel} - ${info.label}` : info.label) : nivel}
    </Badge>
  );
}
