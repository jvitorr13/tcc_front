import type { ReactNode } from "react";

import { Card } from "@/components/ui/Card";
import { cn } from "@/utils/cn";

export interface FormPageProps {
  title: string;
  subtitle?: string;
  /** "md" (600px) para formulários simples; "lg" (800px) para formulários com muitos campos, ex: Empresa. */
  width?: "md" | "lg";
  children: ReactNode;
}

const WIDTH_CLASSES: Record<NonNullable<FormPageProps["width"]>, string> = {
  md: "max-w-[600px]",
  lg: "max-w-[800px]",
};

/**
 * Casca das telas de cadastro/edição (usuário, empresa, ...). O card tem
 * largura fixa e fica centralizado na área principal — deixar esse card
 * esticar 100% da largura disponível deixa formulários de poucos campos
 * com espaço vazio sobrando e visualmente pesados. `width="lg"` é para
 * formulários com muitos campos, que também usam grid de 2 colunas
 * internamente (ver EmpresaForm).
 */
export function FormPage({ title, subtitle, width = "md", children }: FormPageProps) {
  return (
    <div className={cn("mx-auto mt-8", WIDTH_CLASSES[width])}>
      <h1 className="font-display text-2xl text-ink-900">{title}</h1>
      {subtitle && <p className="mt-1 text-sm text-ink-600">{subtitle}</p>}

      <Card className="mt-6 rounded-xl p-6 sm:p-8">{children}</Card>
    </div>
  );
}
