import { LogOut } from "lucide-react";
import type { ReactNode } from "react";

import { useAuth } from "@/hooks/useAuth";

interface AppLayoutProps {
  children: ReactNode;
}

/**
 * Casca visual das páginas privadas (pós-login). Hoje só tem uma topbar com
 * identidade do usuário e logout; quando os próximos módulos (empresas,
 * diagnósticos, dashboard...) entrarem, uma sidebar de navegação se encaixa
 * aqui sem afetar as páginas que já usam este layout.
 */
export function AppLayout({ children }: AppLayoutProps) {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-canvas">
      <header className="flex h-16 items-center justify-between border-b border-ink-900/8 bg-surface px-6">
        <span className="font-display text-lg text-ink-900">Confero</span>

        <div className="flex items-center gap-4">
          {user && (
            <div className="text-right leading-tight">
              <p className="text-sm font-medium text-ink-900">{user.nome}</p>
              <p className="text-xs text-ink-500">{user.tipo_usuario}</p>
            </div>
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

      <main className="p-6">{children}</main>
    </div>
  );
}
