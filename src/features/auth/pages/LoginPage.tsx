import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { getErrorMessage } from "@/lib/get-error-message";

import { AuthLayout } from "@/layouts/AuthLayout";
import { useAuth } from "@/hooks/useAuth";
import { ROUTES } from "@/constants/routes";

import { LoginForm } from "@/features/auth/components/LoginForm";
import type { LoginFormData } from "@/features/auth/schemas/login.schema";

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  async function handleSubmit(data: LoginFormData) {
    setSubmitError(null);
    setIsSubmitting(true);
    try {
      await login({ email: data.email, senha: data.senha });
      navigate(ROUTES.dashboard, { replace: true });
    } catch (error) {
      setSubmitError(getErrorMessage(error, "E-mail ou senha inválidos."));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <AuthLayout title="Entrar na plataforma" subtitle="Acesse com as credenciais da sua consultoria.">
      <LoginForm onSubmit={handleSubmit} isSubmitting={isSubmitting} submitError={submitError} />
    </AuthLayout>
  );
}
