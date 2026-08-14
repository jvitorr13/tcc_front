import type { FieldValues, Path, UseFormRegister } from "react-hook-form";

import { ErrorMessage } from "@/components/feedback/ErrorMessage";

export interface RadioOption {
  value: string;
  label: string;
}

export interface RadioGroupFieldProps<TFieldValues extends FieldValues> {
  legend: string;
  name: Path<TFieldValues>;
  options: readonly RadioOption[];
  register: UseFormRegister<TFieldValues>;
  error?: string;
}

/**
 * Grupo de opções exclusivas renderizado como segmented control (em vez de
 * radio nativo visível), usado pelos formulários de usuário para campos como
 * "Tipo de usuário" e "Status". `register(name)` é espalhado em cada opção —
 * é o padrão do react-hook-form para grupos de radio com o mesmo `name`.
 */
export function RadioGroupField<TFieldValues extends FieldValues>({
  legend,
  name,
  options,
  register,
  error,
}: RadioGroupFieldProps<TFieldValues>) {
  const labelId = `${name}-label`;

  return (
    <div>
      <span id={labelId} className="mb-1.5 block text-sm font-medium text-ink-800">
        {legend}
      </span>
      <div role="radiogroup" aria-labelledby={labelId} className="grid grid-cols-2 gap-3">
        {options.map((option) => (
          <label
            key={option.value}
            className="flex h-11 cursor-pointer items-center justify-center rounded-lg border border-ink-900/15 text-sm font-medium text-ink-700 transition-colors has-[:checked]:border-gold-500 has-[:checked]:bg-gold-100 has-[:checked]:text-ink-900 has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-gold-500"
          >
            <input type="radio" value={option.value} className="sr-only" {...register(name)} />
            {option.label}
          </label>
        ))}
      </div>
      <ErrorMessage>{error}</ErrorMessage>
    </div>
  );
}
