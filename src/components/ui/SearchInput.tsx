import { Search } from "lucide-react";
import { type InputHTMLAttributes, forwardRef } from "react";

import { cn } from "@/utils/cn";

export type SearchInputProps = InputHTMLAttributes<HTMLInputElement>;

/**
 * Campo de busca usado nos cabeçalhos das telas de listagem (Usuários,
 * Empresas). Mesma altura/borda/foco do Input, com um ícone fixo à
 * esquerda em vez de label — não é um campo de formulário, é um filtro.
 */
export const SearchInput = forwardRef<HTMLInputElement, SearchInputProps>(({ className, ...props }, ref) => {
  return (
    <div className="relative">
      <Search size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-500" />
      <input
        ref={ref}
        type="search"
        className={cn(
          "h-11 w-full rounded-lg border border-ink-900/15 bg-white pl-10 pr-3.5 text-sm text-ink-900",
          "placeholder:text-ink-500/60",
          "transition-colors duration-150",
          "focus:outline-none focus:ring-2 focus:ring-gold-500/40 focus:border-gold-500",
          className,
        )}
        {...props}
      />
    </div>
  );
});

SearchInput.displayName = "SearchInput";
