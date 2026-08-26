import { type TextareaHTMLAttributes, forwardRef } from "react";

import { ErrorMessage } from "@/components/feedback/ErrorMessage";
import { Label } from "@/components/ui/Label";
import { Textarea } from "@/components/ui/Textarea";

export interface TextareaFieldProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  error?: string;
}

/**
 * Mesmo papel do FormField (label + controle + erro, pronto pra
 * register("campo")), para campos de texto longo — ver Textarea.
 */
export const TextareaField = forwardRef<HTMLTextAreaElement, TextareaFieldProps>(
  ({ label, error, id, ...props }, ref) => {
    const fieldId = id ?? props.name;

    return (
      <div>
        <Label htmlFor={fieldId}>{label}</Label>
        <Textarea
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

TextareaField.displayName = "TextareaField";
