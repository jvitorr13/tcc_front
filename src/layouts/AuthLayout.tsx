import type { ReactNode } from "react";

import { BrandPanel } from "@/components/layout/BrandPanel";

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
          <div className="mb-8 lg:hidden">
            <span className="font-display text-xl text-ink-900">Confero</span>
            <p className="text-xs uppercase tracking-[0.2em] text-gold-600">
              Consultoria Empresarial
            </p>
          </div>

          <h1 className="font-display text-2xl text-ink-900">{title}</h1>
          {subtitle && <p className="mt-1.5 text-sm text-ink-600">{subtitle}</p>}

          <div className="mt-8">{children}</div>
        </div>
      </main>
    </div>
  );
}
