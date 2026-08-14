import { zodResolver } from "@hookform/resolvers/zod";
import { UserPlus } from "lucide-react";
import { useForm } from "react-hook-form";

import { ErrorMessage } from "@/components/feedback/ErrorMessage";
import { FormField } from "@/components/forms/FormField";
import { RadioGroupField } from "@/components/forms/RadioGroupField";
import { Button } from "@/components/ui/Button";

import { registerSchema, type RegisterFormData } from "@/features/auth/schemas/register.schema";

export interface RegisterFormProps {
  onSubmit: (data: RegisterFormData) => void | Promise<void>;
  isSubmitting: boolean;
  submitError?: string | null;
}

const TIPO_USUARIO_OPTIONS = [
  { value: "CONSULTOR", label: "Consultor" },
  { value: "EMPRESA", label: "Empresa" },
] as const;

/**
 * Formulário de cadastro puro, no mesmo espírito do LoginForm: só valida
 * campos e dispara onSubmit com os dados já conferidos (incluindo a
 * confirmação de senha, via refine do registerSchema). Quem decide o que
 * fazer com o cadastro (chamar a API, navegar para o login) é a página.
 */
export function RegisterForm({ onSubmit, isSubmitting, submitError }: RegisterFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: { nome: "", email: "", senha: "", confirmarSenha: "", tipo_usuario: "CONSULTOR" },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
      <FormField
        label="Nome completo"
        autoComplete="name"
        placeholder="Seu nome completo"
        error={errors.nome?.message}
        {...register("nome")}
      />

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
        autoComplete="new-password"
        placeholder="••••••••"
        error={errors.senha?.message}
        {...register("senha")}
      />

      <FormField
        label="Confirmar senha"
        isPassword
        autoComplete="new-password"
        placeholder="••••••••"
        error={errors.confirmarSenha?.message}
        {...register("confirmarSenha")}
      />

      <RadioGroupField
        legend="Tipo de usuário"
        name="tipo_usuario"
        options={TIPO_USUARIO_OPTIONS}
        register={register}
        error={errors.tipo_usuario?.message}
      />

      {submitError && (
        <div className="rounded-lg border border-danger-500/20 bg-danger-50 px-3.5 py-2.5">
          <ErrorMessage className="mt-0">{submitError}</ErrorMessage>
        </div>
      )}

      <Button type="submit" size="lg" className="w-full" isLoading={isSubmitting}>
        {!isSubmitting && <UserPlus size={17} />}
        Cadastrar
      </Button>
    </form>
  );
}
