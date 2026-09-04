import { TrendingUp } from "lucide-react";

import { ComingSoon } from "@/components/feedback/ComingSoon";
import { AppLayout } from "@/layouts/AppLayout";

/** Sem tela real ainda — nenhum endpoint de evolução histórica definido no back-end. */
export function EvolucaoPage() {
  return (
    <AppLayout>
      <h1 className="font-display text-2xl text-ink-900">Evolução</h1>
      <p className="mt-1 text-sm text-ink-600">Comparação de resultados de diagnóstico de uma empresa ao longo do tempo.</p>

      <ComingSoon
        icon={TrendingUp}
        title="Módulo em construção"
        description="Esta tela ainda não tem back-end disponível. Volte em breve."
      />
    </AppLayout>
  );
}
