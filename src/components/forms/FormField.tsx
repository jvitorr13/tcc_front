import { type InputHTMLAttributes, forwardRef } from "react";

import { ErrorMessage } from "@/components/feedback/ErrorMessage";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { PasswordInput } from "@/components/ui/PasswordInput";

export interface FormFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  /** Quando true, renderiza PasswordInput (com toggle de visibilidade) em vez de Input. */
  isPassword?: boolean;
}

/**
 * Campo de formulário completo: label + input + mensagem de erro, com o
 * `ref` encaminhado para o input — pronto para `register("campo")` do
 * react-hook-form. Este é o componente que as páginas de formulário devem
 * usar; Input/PasswordInput/Label/ErrorMessage ficam em components/ui e
 * components/feedback como peças menores e reutilizáveis isoladamente.
 */
export const FormField = forwardRef<HTMLInputElement, FormFieldProps>(
  ({ label, error, isPassword, id, ...props }, ref) => {
    const fieldId = id ?? props.name;
    const InputComponent = isPassword ? PasswordInput : Input;

    return (
      <div>
        <Label htmlFor={fieldId}>{label}</Label>
        <InputComponent
          ref={ref}
          id={fieldId}
          hasError={Boolean(error)}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${fieldId}-error` : undefined}
          {...props}
        />
        <ErrorMessage>{error}</ErrorMessage>
      </div>
    );
  },
);

FormField.displayName = "FormField";
