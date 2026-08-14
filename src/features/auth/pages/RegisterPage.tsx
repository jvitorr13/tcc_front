import { Link, useNavigate } from "react-router-dom";

import { getErrorMessage } from "@/lib/get-error-message";

import { AuthLayout } from "@/layouts/AuthLayout";
import { ROUTES } from "@/constants/routes";

import { RegisterForm } from "@/features/auth/components/RegisterForm";
import { useRegisterMutation } from "@/features/auth/hooks/useRegisterMutation";
import type { RegisterFormData } from "@/features/auth/schemas/register.schema";

export function RegisterPage() {
  const navigate = useNavigate();
  const { mutateAsync, isPending, error } = useRegisterMutation();

  async function handleSubmit(data: RegisterFormData) {
    try {
      await mutateAsync({
        nome: data.nome,
        email: data.email,
        senha: data.senha,
        tipo_usuario: data.tipo_usuario,
      });
      navigate(ROUTES.login, {
        replace: true,
        state: { successMessage: "Cadastro realizado com sucesso! Faça login para continuar." },
      });
    } catch {
      // erro já exposto pelo `error` do useRegisterMutation, tratado abaixo
    }
  }

  return (
    <AuthLayout title="Cadastrar usuário" subtitle="Crie sua conta para acessar a plataforma.">
      <RegisterForm
        onSubmit={handleSubmit}
        isSubmitting={isPending}
        submitError={error ? getErrorMessage(error, "Não foi possível concluir o cadastro.") : null}
      />

      <p className="mt-6 text-center text-sm text-ink-600">
        Já tem uma conta?{" "}
        <Link to={ROUTES.login} className="font-medium text-ink-900 hover:text-gold-600">
          Entrar
        </Link>
      </p>
    </AuthLayout>
  );
}
