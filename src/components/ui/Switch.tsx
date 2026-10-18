import { cn } from "@/utils/cn";

export interface SwitchProps {
  id: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  /** Frase abaixo do rótulo — normalmente explica o que o estado atual significa. */
  description?: string;
  disabled?: boolean;
}

/**
 * Chave liga/desliga (role="switch"), para opções binárias com efeito
 * imediato no significado do registro (ex: compartilhar com a empresa). Pra
 * uma lista de opções independentes, continue usando checkbox.
 */
export function Switch({ id, checked, onChange, label, description, disabled }: SwitchProps) {
  return (
    <div className="flex items-start gap-3">
      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={checked}
        aria-describedby={description ? `${id}-description` : undefined}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={cn(
          "relative mt-0.5 inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors",
          "focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-500/40",
          "disabled:cursor-not-allowed disabled:opacity-60",
          checked ? "bg-ink-900" : "bg-ink-900/20",
        )}
      >
        <span
          aria-hidden
          className={cn(
            "inline-block size-5 rounded-full bg-white shadow transition-transform",
            checked ? "translate-x-5" : "translate-x-0.5",
          )}
        />
      </button>
      <div>
        <label htmlFor={id} className="text-sm font-medium text-ink-900">
          {label}
        </label>
        {description && (
          <p id={`${id}-description`} className="mt-0.5 text-xs text-ink-500">
            {description}
          </p>
        )}
      </div>
    </div>
  );
}
