import { Compass } from "lucide-react";
import { NavLink } from "react-router-dom";

import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/utils/cn";
import { isRoleAllowed, MODULES, resolveMenuLabel, resolveMenuTo } from "@/routes/modules";

/**
 * Navegação lateral — gerada a partir da mesma tabela central de módulos
 * que AppRoutes.tsx usa pra montar as rotas (ver routes/modules.ts), já
 * filtrada por tipo_usuario. Nenhum item de menu é hardcoded aqui.
 */
export function Sidebar() {
  const { user } = useAuth();

  const items = user
    ? MODULES.filter((module) => module.menu && isRoleAllowed(module.roles, user.tipo_usuario))
    : [];

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
        {items.map((module) => {
          const { icon: Icon, label, to, end } = module.menu!;
          return (
            <NavLink
              key={module.key}
              to={resolveMenuTo(to, module.path, user!)}
              end={end}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                  isActive ? "bg-gold-100 text-ink-900" : "text-ink-600 hover:bg-ink-900/5 hover:text-ink-900",
                )
              }
            >
              <Icon size={17} />
              {resolveMenuLabel(label, user!.tipo_usuario)}
            </NavLink>
          );
        })}
      </nav>
    </aside>
  );
}
