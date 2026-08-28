import type { LucideIcon } from "lucide-react";

import { Card } from "@/components/ui/Card";

export interface ComingSoonProps {
  icon: LucideIcon;
  title: string;
  description: string;
}

/**
 * Corpo de uma tela de módulo que já tem entrada no menu mas ainda não tem
 * back-end/tela real (ex: Plano de Ação, Configurações). Evita 404: a rota
 * existe e renderiza algo, só não tem funcionalidade ainda.
 */
export function ComingSoon({ icon: Icon, title, description }: ComingSoonProps) {
  return (
    <Card className="mt-6 flex flex-col items-center gap-3 px-6 py-16 text-center">
      <span className="flex size-12 items-center justify-center rounded-full bg-ink-900/5 text-ink-700">
        <Icon size={22} />
      </span>
      <div>
        <p className="text-sm font-medium text-ink-900">{title}</p>
        <p className="mt-1 max-w-sm text-sm text-ink-500">{description}</p>
      </div>
    </Card>
  );
}
