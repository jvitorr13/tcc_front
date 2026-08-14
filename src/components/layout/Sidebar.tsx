import { Building2, Compass, Home, Users } from "lucide-react";
import { NavLink } from "react-router-dom";

import { ROUTES } from "@/constants/routes";
import { cn } from "@/utils/cn";

const NAV_ITEMS = [
  { to: ROUTES.dashboard, label: "Início", icon: Home, end: true },
  { to: ROUTES.usuarios, label: "Usuários", icon: Users, end: false },
  { to: ROUTES.empresas, label: "Empresas", icon: Building2, end: false },
];

/**
 * Navegação lateral das páginas privadas. Só lista os módulos que já têm
 * tela implementada — nada de links para rotas reservadas em ROUTES que
 * ainda não têm página (ver comentário em AppRoutes.tsx).
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
