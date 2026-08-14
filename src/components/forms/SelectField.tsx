import { type SelectHTMLAttributes, forwardRef } from "react";

import { ErrorMessage } from "@/components/feedback/ErrorMessage";
import { Label } from "@/components/ui/Label";
import { Select } from "@/components/ui/Select";

export interface SelectFieldProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  error?: string;
}

/**
 * Mesmo papel do FormField (label + controle + erro, pronto pra
 * register("campo")), só que para Select em vez de Input — usado onde a
 * opção vem de uma lista carregada da API (ex: empresa vinculada).
 */
export const SelectField = forwardRef<HTMLSelectElement, SelectFieldProps>(
  ({ label, error, id, children, ...props }, ref) => {
    const fieldId = id ?? props.name;

    return (
      <div>
        <Label htmlFor={fieldId}>{label}</Label>
        <Select
          ref={ref}
          id={fieldId}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${fieldId}-error` : undefined}
          {...props}
        >
          {children}
        </Select>
        <ErrorMessage>{error}</ErrorMessage>
      </div>
    );
  },
);

SelectField.displayName = "SelectField";
