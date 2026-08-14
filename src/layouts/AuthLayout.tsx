import { Compass } from "lucide-react";
import type { ReactNode } from "react";

import { BrandPanel } from "@/components/layout/BrandPanel";
import { Card } from "@/components/ui/Card";

interface AuthLayoutProps {
  children: ReactNode;
  title: string;
  subtitle?: string;
}

/**
 * Layout compartilhado por todas as telas de autenticação. Fica em
 * src/layouts (e não em features/auth/components) porque é genérico o
 * bastante para ser reaproveitado por telas futuras que não pertencem
 * estritamente à feature de auth (ex: convite de novo consultor).
 */
export function AuthLayout({ children, title, subtitle }: AuthLayoutProps) {
  return (
    <div className="flex min-h-screen bg-canvas">
      <BrandPanel />

      <main className="flex flex-1 items-center justify-center px-6 py-12 sm:px-10">
        <div className="w-full max-w-sm animate-fade-in-up">
          <div className="mb-8 flex items-center gap-2.5 lg:hidden">
            <span className="flex size-9 items-center justify-center rounded-lg bg-ink-900 text-gold-400">
              <Compass size={18} />
            </span>
            <span className="text-xs font-medium uppercase tracking-[0.2em] text-ink-600">
              Consultoria Empresarial
            </span>
          </div>

          <Card className="p-6 sm:p-8">
            <h1 className="font-display text-2xl text-ink-900">{title}</h1>
            {subtitle && <p className="mt-1.5 text-sm text-ink-600">{subtitle}</p>}

            <div className="mt-7">{children}</div>
          </Card>
        </div>
      </main>
    </div>
  );
}
