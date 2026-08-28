import { Settings } from "lucide-react";

import { ComingSoon } from "@/components/feedback/ComingSoon";
import { AppLayout } from "@/layouts/AppLayout";

/** Sem tela real ainda — nenhum endpoint de configurações definido no back-end. */
export function ConfiguracoesPage() {
  return (
    <AppLayout>
      <h1 className="font-display text-2xl text-ink-900">Configurações</h1>
      <p className="mt-1 text-sm text-ink-600">Preferências da conta e da plataforma.</p>

      <ComingSoon
        icon={Settings}
        title="Módulo em construção"
        description="Esta tela ainda não tem back-end disponível. Volte em breve."
      />
    </AppLayout>
  );
}
