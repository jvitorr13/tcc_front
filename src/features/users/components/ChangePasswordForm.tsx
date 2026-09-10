import { zodResolver } from "@hookform/resolvers/zod";
import { KeyRound } from "lucide-react";
import { useForm } from "react-hook-form";

import { ErrorMessage } from "@/components/feedback/ErrorMessage";
import { FormField } from "@/components/forms/FormField";
import { Button } from "@/components/ui/Button";

import { changePasswordSchema, type ChangePasswordFormData } from "@/features/users/schemas/change-password.schema";

export interface ChangePasswordFormProps {
  onSubmit: (data: ChangePasswordFormData) => void | Promise<void>;
  isSubmitting: boolean;
  submitError?: string | null;
}

/** Formulário puro — a página decide como enviar (ver ProfilePage) e remonta este componente (via `key`) para limpar os campos após sucesso. */
export function ChangePasswordForm({ onSubmit, isSubmitting, submitError }: ChangePasswordFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ChangePasswordFormData>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: { senha: "", confirmarSenha: "" },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
      <FormField label="Nova senha" isPassword error={errors.senha?.message} {...register("senha")} />
      <FormField
        label="Confirmar nova senha"
        isPassword
        error={errors.confirmarSenha?.message}
        {...register("confirmarSenha")}
      />

      {submitError && <ErrorMessage>{submitError}</ErrorMessage>}

      <Button type="submit" isLoading={isSubmitting}>
        <KeyRound size={16} />
        Alterar senha
      </Button>
    </form>
  );
}
