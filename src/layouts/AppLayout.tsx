import { LogOut } from "lucide-react";
import type { ReactNode } from "react";
import { Link } from "react-router-dom";

import { Sidebar } from "@/components/layout/Sidebar";
import { useAuth } from "@/hooks/useAuth";
import { ROUTES } from "@/constants/routes";

interface AppLayoutProps {
  children: ReactNode;
}

/**
 * Casca visual das páginas privadas (pós-login): sidebar de navegação +
 * topbar com identidade do usuário e logout. Cada módulo novo (empresas,
 * diagnósticos, plano de ação...) só precisa envolver sua página com
 * <AppLayout> e adicionar sua entrada em components/layout/Sidebar.tsx.
 */
export function AppLayout({ children }: AppLayoutProps) {
  const { user, logout } = useAuth();

  return (
    <div className="flex min-h-screen bg-canvas">
      <Sidebar />

      <div className="flex min-h-screen flex-1 flex-col">
        <header className="flex h-16 items-center border-b border-ink-900/8 bg-surface px-6">
          <span className="text-xs font-medium uppercase tracking-[0.2em] text-ink-600 lg:hidden">
            Consultoria Empresarial
          </span>

          <div className="ml-auto flex items-center gap-4">
            {user && (
              <Link
                to={ROUTES.perfil}
                className="rounded-lg px-2 py-1 text-right leading-tight transition-colors hover:bg-ink-900/5"
                title="Meu perfil"
              >
                <p className="text-sm font-medium text-ink-900">{user.nome}</p>
                <p className="text-xs text-ink-500">{user.tipo_usuario}</p>
              </Link>
            )}
            <button
              onClick={logout}
              className="flex size-9 items-center justify-center rounded-lg text-ink-600 transition-colors hover:bg-ink-900/5 hover:text-danger-600"
              aria-label="Sair"
              title="Sair"
            >
              <LogOut size={18} />
            </button>
          </div>
        </header>

        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
