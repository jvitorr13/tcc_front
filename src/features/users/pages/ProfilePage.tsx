import { useState } from "react";

import { getErrorMessage } from "@/lib/get-error-message";

import { SuccessMessage } from "@/components/feedback/SuccessMessage";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { AppLayout } from "@/layouts/AppLayout";
import { useAuth } from "@/hooks/useAuth";

import { useEmpresaQuery } from "@/features/empresas";

import { ChangePasswordForm } from "@/features/users/components/ChangePasswordForm";
import { useChangePasswordMutation } from "@/features/users/hooks/useChangePasswordMutation";
import type { ChangePasswordFormData } from "@/features/users/schemas/change-password.schema";

const TIPO_USUARIO_LABELS: Record<string, string> = {
  CONSULTOR: "Consultor",
  EMPRESA: "Empresa",
};

/**
 * "Meu perfil" — acessado clicando no nome/perfil no canto do header (ver
 * AppLayout). Mostra os dados do usuário logado (read-only: nome/e-mail/
 * tipo são editados pelo cadastro de Usuários, não aqui) e permite trocar a
 * própria senha.
 */
export function ProfilePage() {
  const { user } = useAuth();
  // GET /empresas/{id}: funciona pra EMPRESA (só a própria). GET /empresas é só CONSULTOR.
  const { data: empresa } = useEmpresaQuery(user?.empresa_id);

  const changePasswordMutation = useChangePasswordMutation();
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);
  const [formKey, setFormKey] = useState(0);

  async function handleChangePassword(data: ChangePasswordFormData) {
    if (!user) return;
    setPasswordError(null);
    setPasswordSuccess(null);
    try {
      await changePasswordMutation.mutateAsync({ user, senha: data.senha });
      setPasswordSuccess("Senha alterada com sucesso.");
      setFormKey((key) => key + 1);
    } catch (err) {
      setPasswordError(getErrorMessage(err, "Não foi possível alterar a senha."));
    }
  }

  if (!user) return null;

  return (
    <AppLayout>
      <h1 className="font-display text-2xl text-ink-900">Meu perfil</h1>
      <p className="mt-1 text-sm text-ink-600">Suas informações de acesso à plataforma.</p>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Card className="p-6">
          <h2 className="font-display text-lg text-ink-900">Informações</h2>
          <dl className="mt-4 divide-y divide-ink-900/6 text-sm">
            <div className="flex items-center justify-between py-2.5">
              <dt className="text-ink-600">Nome</dt>
              <dd className="font-medium text-ink-900">{user.nome}</dd>
            </div>
            <div className="flex items-center justify-between py-2.5">
              <dt className="text-ink-600">E-mail</dt>
              <dd className="font-medium text-ink-900">{user.email}</dd>
            </div>
            <div className="flex items-center justify-between py-2.5">
              <dt className="text-ink-600">Perfil</dt>
              <dd>
                <Badge variant="neutral">{TIPO_USUARIO_LABELS[user.tipo_usuario] ?? user.tipo_usuario}</Badge>
              </dd>
            </div>
            {user.tipo_usuario === "EMPRESA" && (
              <div className="flex items-center justify-between py-2.5">
                <dt className="text-ink-600">Empresa</dt>
                <dd className="font-medium text-ink-900">
                  {empresa ? empresa.nome_fantasia || empresa.razao_social : "—"}
                </dd>
              </div>
            )}
            <div className="flex items-center justify-between py-2.5">
              <dt className="text-ink-600">Status</dt>
              <dd>
                <Badge variant={user.ativo ? "success" : "danger"}>{user.ativo ? "Ativo" : "Inativo"}</Badge>
              </dd>
            </div>
          </dl>
        </Card>

        <Card className="p-6">
          <h2 className="font-display text-lg text-ink-900">Alterar senha</h2>
          <p className="mt-1 text-sm text-ink-600">Defina uma nova senha de acesso à plataforma.</p>

          {passwordSuccess && <SuccessMessage className="mt-3">{passwordSuccess}</SuccessMessage>}

          <div className="mt-4">
            <ChangePasswordForm
              key={formKey}
              onSubmit={handleChangePassword}
              isSubmitting={changePasswordMutation.isPending}
              submitError={passwordError}
            />
          </div>
        </Card>
      </div>
    </AppLayout>
  );
}
