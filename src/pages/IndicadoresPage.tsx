import { Gauge } from "lucide-react";

import { ComingSoon } from "@/components/feedback/ComingSoon";
import { AppLayout } from "@/layouts/AppLayout";

/** Sem tela real ainda — nenhum endpoint de indicadores/analytics definido no back-end. */
export function IndicadoresPage() {
  return (
    <AppLayout>
      <h1 className="font-display text-2xl text-ink-900">Indicadores</h1>
      <p className="mt-1 text-sm text-ink-600">Visão consolidada dos resultados de diagnóstico por empresa e período.</p>

      <ComingSoon
        icon={Gauge}
        title="Módulo em construção"
        description="Esta tela ainda não tem back-end disponível. Volte em breve."
      />
    </AppLayout>
  );
}
