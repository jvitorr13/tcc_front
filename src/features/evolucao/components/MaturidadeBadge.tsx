import { Badge } from "@/components/ui/Badge";
import { cn } from "@/utils/cn";

import { NIVEL_MATURIDADE_CLASSES, NIVEL_MATURIDADE_LABELS } from "@/features/evolucao/constants/maturidade";
import type { NivelMaturidade } from "@/features/evolucao/types/evolucao.types";

export interface MaturidadeBadgeProps {
  nivel: NivelMaturidade;
  className?: string;
}

/**
 * Badge do nível de maturidade — não usa as variantes genéricas do Badge
 * (só cobrem 4 cores) porque são 5 estados fixos com uma escala própria; o
 * className aqui sobrepõe o bg/text de "neutral" via tailwind-merge (Badge
 * já mescla className internamente com cn()).
 */
export function MaturidadeBadge({ nivel, className }: MaturidadeBadgeProps) {
  return (
    <Badge variant="neutral" className={cn(NIVEL_MATURIDADE_CLASSES[nivel], className)}>
      {NIVEL_MATURIDADE_LABELS[nivel]}
    </Badge>
  );
}
