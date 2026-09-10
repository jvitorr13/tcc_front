import { Building2, ClipboardList, Compass, Home, LayoutDashboard, Settings, Target, TrendingUp, Users } from "lucide-react";
import { NavLink } from "react-router-dom";

import { ROUTES } from "@/constants/routes";
import { cn } from "@/utils/cn";

const NAV_ITEMS = [
  { to: ROUTES.dashboard, label: "Início", icon: Home, end: true },
  { to: ROUTES.usuarios, label: "Usuários", icon: Users, end: false },
  { to: ROUTES.empresas, label: "Empresas", icon: Building2, end: false },
  { to: ROUTES.dashboards, label: "Dashboards", icon: LayoutDashboard, end: false },
  { to: ROUTES.diagnosticos, label: "Diagnósticos", icon: ClipboardList, end: false },
  { to: ROUTES.planosAcao, label: "Planos de Ação", icon: Target, end: false },
  // Indicadores: módulo já implementado (features/indicadores), só tirado
  // do menu por pedido temporário — reativar é só devolver a linha abaixo:
  // { to: ROUTES.indicadores, label: "Indicadores", icon: Gauge, end: false },
  { to: ROUTES.evolucao, label: "Evolução", icon: TrendingUp, end: false },
  { to: ROUTES.configuracoes, label: "Configurações", icon: Settings, end: false },
];

/**
 * Navegação lateral das páginas privadas. Configurações tem rota e entrada
 * no menu, mas ainda sem back-end — a página renderiza um placeholder (ver
 * ComingSoon) em vez de 404. Indicadores tem tela e back-end prontos, mas
 * está fora do menu por ora (ver NAV_ITEMS acima). Módulos que nem tela têm
 * (Perguntas, Respostas, Tarefas como telas avulsas) ficam de fora daqui —
 * rota reservada em ROUTES, sem link (ver comentário em AppRoutes.tsx).
 */
export function Sidebar() {
  return (
    <aside className="hidden w-60 shrink-0 flex-col border-r border-ink-900/8 bg-surface px-4 py-6 lg:flex">
      <div className="flex items-center gap-2.5 px-2">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-ink-900 text-gold-400">
          <Compass size={18} />
        </span>
        <span className="text-xs font-medium uppercase tracking-[0.2em] text-ink-600">
          Consultoria Empresarial
        </span>
      </div>

      <nav className="mt-8 flex flex-col gap-1">
        {NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                isActive ? "bg-gold-100 text-ink-900" : "text-ink-600 hover:bg-ink-900/5 hover:text-ink-900",
              )
            }
          >
            <Icon size={17} />
            {label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
