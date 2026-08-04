import { ClipboardCheck, LineChart, Target } from "lucide-react";

import { Card } from "@/components/ui/Card";
import { AppLayout } from "@/layouts/AppLayout";
import { useAuth } from "@/hooks/useAuth";

const NEXT_MODULES = [
  { icon: ClipboardCheck, label: "Diagnósticos", description: "Ainda não implementado" },
  { icon: Target, label: "Plano de Ação", description: "Ainda não implementado" },
  { icon: LineChart, label: "Dashboard analítico", description: "Ainda não implementado" },
];

/**
 * Placeholder da rota privada raiz. Existe para provar, de ponta a ponta,
 * que o fluxo de autenticação funciona (login → sessão → rota protegida →
 * logout). Os próximos módulos do sistema substituem/complementam esta
 * página conforme forem implementados.
 */
export function DashboardPage() {
  const { user } = useAuth();

  return (
    <AppLayout>
      <h1 className="font-display text-2xl text-ink-900">Olá, {user?.nome?.split(" ")[0]}</h1>
      <p className="mt-1 text-sm text-ink-600">
        Este é o ponto de partida da plataforma. Os módulos abaixo entram aqui conforme forem construídos.
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        {NEXT_MODULES.map(({ icon: Icon, label, description }) => (
          <Card key={label} className="p-5">
            <Icon size={20} className="text-gold-600" />
            <p className="mt-3 text-sm font-medium text-ink-900">{label}</p>
            <p className="mt-0.5 text-xs text-ink-500">{description}</p>
          </Card>
        ))}
      </div>
    </AppLayout>
  );
}
