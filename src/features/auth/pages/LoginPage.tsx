import { isAxiosError } from "axios";
import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

import { getErrorMessage } from "@/lib/get-error-message";
import { getInitialRoute } from "@/lib/get-initial-route";

import { SuccessMessage } from "@/components/feedback/SuccessMessage";
import { AuthLayout } from "@/layouts/AuthLayout";
import { useAuth } from "@/hooks/useAuth";
import { ROUTES } from "@/constants/routes";

import { LoginForm } from "@/features/auth/components/LoginForm";
import type { LoginFormData } from "@/features/auth/schemas/login.schema";

const CREDENCIAIS_INVALIDAS = "E-mail ou senha inválidos.";

interface LoginLocationState {
  successMessage?: string;
}

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Mensagem enviada pela tela de cadastro após um cadastro bem-sucedido
  // (ver RegisterPage). Lida só na primeira renderização: se o usuário
  // atualizar a página, o state do histórico some e a mensagem some com ele.
  const [successMessage] = useState(() => (location.state as LoginLocationState | null)?.successMessage ?? null);

  async function handleSubmit(data: LoginFormData) {
    setSubmitError(null);
    setIsSubmitting(true);
    try {
      const loggedUser = await login({ email: data.email, senha: data.senha });
      navigate(getInitialRoute(loggedUser), { replace: true });
    } catch (error) {
      // 401 é sempre a mesma mensagem genérica — o back-end não distingue
      // e-mail inexistente, senha errada ou conta desativada (mesmo status,
      // mesmo caso), então o front não tenta inferir qual foi. Só 400 (ex:
      // e-mail ausente/mal formatado) mostra a mensagem específica do
      // back-end; qualquer outro erro cai no fallback genérico de sempre.
      if (isAxiosError(error) && error.response?.status === 401) {
        setSubmitError(CREDENCIAIS_INVALIDAS);
      } else {
        setSubmitError(getErrorMessage(error, CREDENCIAIS_INVALIDAS));
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <AuthLayout title="Entrar na plataforma" subtitle="Acesse com as credenciais da sua consultoria.">
      {successMessage && <SuccessMessage className="mb-5">{successMessage}</SuccessMessage>}

      <LoginForm onSubmit={handleSubmit} isSubmitting={isSubmitting} submitError={submitError} />

      <p className="mt-6 text-center text-sm text-ink-600">
        Ainda não tem uma conta?{" "}
        <Link to={ROUTES.register} className="font-medium text-ink-900 hover:text-gold-600">
          Cadastre-se
        </Link>
      </p>
    </AuthLayout>
  );
}
