import { Target } from "lucide-react";

import { ComingSoon } from "@/components/feedback/ComingSoon";
import { AppLayout } from "@/layouts/AppLayout";

/** Sem back-end ainda (internal/plano-acao não existe) — só a entrada no menu e a rota reservada. */
export function PlanoAcaoPage() {
  return (
    <AppLayout>
      <h1 className="font-display text-2xl text-ink-900">Plano de Ação</h1>
      <p className="mt-1 text-sm text-ink-600">Acompanhamento das ações recomendadas a partir dos diagnósticos.</p>

      <ComingSoon
        icon={Target}
        title="Módulo em construção"
        description="Esta tela ainda não tem back-end disponível. Volte em breve."
      />
    </AppLayout>
  );
}
