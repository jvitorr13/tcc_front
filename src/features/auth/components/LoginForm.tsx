import { zodResolver } from "@hookform/resolvers/zod";
import { LogIn } from "lucide-react";
import { useForm } from "react-hook-form";

import { ErrorMessage } from "@/components/feedback/ErrorMessage";
import { FormField } from "@/components/forms/FormField";
import { Button } from "@/components/ui/Button";

import { loginSchema, type LoginFormData } from "@/features/auth/schemas/login.schema";

export interface LoginFormProps {
  onSubmit: (data: LoginFormData) => void | Promise<void>;
  isSubmitting: boolean;
  submitError?: string | null;
}

/**
 * Formulário de login puro: só sabe validar campos e disparar onSubmit.
 * Não conhece o authService nem a store — quem decide o que fazer com os
 * dados válidos é a página (LoginPage), que injeta onSubmit/isSubmitting.
 * Isso deixa o formulário fácil de reutilizar/testar isoladamente.
 */
export function LoginForm({ onSubmit, isSubmitting, submitError }: LoginFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", senha: "" },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
      <FormField
        label="E-mail"
        type="email"
        autoComplete="email"
        placeholder="voce@empresa.com"
        error={errors.email?.message}
        {...register("email")}
      />

      <FormField
        label="Senha"
        isPassword
        autoComplete="current-password"
        placeholder="••••••••"
        error={errors.senha?.message}
        {...register("senha")}
      />

      {submitError && (
        <div className="rounded-lg border border-danger-500/20 bg-danger-50 px-3.5 py-2.5">
          <ErrorMessage className="mt-0">{submitError}</ErrorMessage>
        </div>
      )}

      <Button type="submit" size="lg" className="w-full" isLoading={isSubmitting}>
        {!isSubmitting && <LogIn size={17} />}
        Entrar
      </Button>
    </form>
  );
}
