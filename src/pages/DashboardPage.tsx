import { Link } from "react-router-dom";

import { Card } from "@/components/ui/Card";
import { AppLayout } from "@/layouts/AppLayout";
import { useAuth } from "@/hooks/useAuth";
import { isRoleAllowed, MODULES, resolveMenuLabel, resolveMenuTo } from "@/routes/modules";

/**
 * Rota inicial ("/") — cada card é um atalho pra um módulo do menu,
 * derivado da mesma tabela central de rotas (ver routes/modules.ts) e já
 * filtrado pelo perfil de quem está logado. "Início" fica de fora (é a
 * própria página atual).
 */
export function DashboardPage() {
  const { user } = useAuth();

  const cards = user
    ? MODULES.filter(
        (module) => module.menu && module.key !== "dashboard" && isRoleAllowed(module.roles, user.tipo_usuario),
      )
    : [];

  return (
    <AppLayout>
      <h1 className="font-display text-2xl text-ink-900">Olá, {user?.nome?.split(" ")[0]}</h1>
      <p className="mt-1 text-sm text-ink-600">Este é o ponto de partida da plataforma. Acesse um módulo abaixo.</p>

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        {cards.map((module) => {
          const { icon: Icon, label, description, to } = module.menu!;
          return (
            <Link key={module.key} to={resolveMenuTo(to, module.path, user!)}>
              <Card className="p-5 transition-colors hover:border-ink-900/20 hover:bg-ink-900/[0.02]">
                <Icon size={20} className="text-gold-600" />
                <p className="mt-3 text-sm font-medium text-ink-900">{resolveMenuLabel(label, user!.tipo_usuario)}</p>
                {description && <p className="mt-0.5 text-xs text-ink-500">{description}</p>}
              </Card>
            </Link>
          );
        })}
      </div>
    </AppLayout>
  );
}
