import { Building2, ClipboardList, Gauge, Settings, Target, TrendingUp, Users } from "lucide-react";
import { Link } from "react-router-dom";

import { Card } from "@/components/ui/Card";
import { AppLayout } from "@/layouts/AppLayout";
import { useAuth } from "@/hooks/useAuth";
import { ROUTES } from "@/constants/routes";

const MODULES = [
  { icon: Users, label: "Usuários", description: "Gerenciar consultores e empresas", to: ROUTES.usuarios },
  { icon: Building2, label: "Empresas", description: "Cadastro de empresas atendidas", to: ROUTES.empresas },
  { icon: ClipboardList, label: "Diagnósticos", description: "Aplicar e acompanhar diagnósticos", to: ROUTES.diagnosticos },
  { icon: Target, label: "Planos de Ação", description: "Acompanhar planos e tarefas", to: ROUTES.planosAcao },
  { icon: Gauge, label: "Indicadores", description: "Acompanhar indicadores de desempenho", to: ROUTES.indicadores },
  { icon: TrendingUp, label: "Evolução", description: "Em construção", to: ROUTES.evolucao },
  { icon: Settings, label: "Configurações", description: "Em construção", to: ROUTES.configuracoes },
];

/**
 * Placeholder da rota privada raiz. Existe para provar, de ponta a ponta,
 * que o fluxo de autenticação funciona (login → sessão → rota protegida →
 * logout) e serve de atalho pros módulos — cada card é um link, mesmo os
 * que ainda caem numa tela "em construção" (ver ComingSoon).
 */
export function DashboardPage() {
  const { user } = useAuth();

  return (
    <AppLayout>
      <h1 className="font-display text-2xl text-ink-900">Olá, {user?.nome?.split(" ")[0]}</h1>
      <p className="mt-1 text-sm text-ink-600">Este é o ponto de partida da plataforma. Acesse um módulo abaixo.</p>

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        {MODULES.map(({ icon: Icon, label, description, to }) => (
          <Link key={label} to={to}>
            <Card className="p-5 transition-colors hover:border-ink-900/20 hover:bg-ink-900/[0.02]">
              <Icon size={20} className="text-gold-600" />
              <p className="mt-3 text-sm font-medium text-ink-900">{label}</p>
              <p className="mt-0.5 text-xs text-ink-500">{description}</p>
            </Card>
          </Link>
        ))}
      </div>
    </AppLayout>
  );
}
