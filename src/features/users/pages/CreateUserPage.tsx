import { useNavigate } from "react-router-dom";

import { getErrorMessage } from "@/lib/get-error-message";

import { FormPage } from "@/components/layout/FormPage";
import { AppLayout } from "@/layouts/AppLayout";
import { ROUTES } from "@/constants/routes";

import { useEmpresasQuery } from "@/features/empresas";
import { CreateUserForm } from "@/features/users/components/CreateUserForm";
import { useCreateUserMutation } from "@/features/users/hooks/useCreateUserMutation";
import type { CreateUserFormData } from "@/features/users/schemas/create-user.schema";

export function CreateUserPage() {
  const navigate = useNavigate();
  const { mutateAsync, isPending, error } = useCreateUserMutation();
  const { data: empresas } = useEmpresasQuery();

  async function handleSubmit(data: CreateUserFormData) {
    try {
      const created = await mutateAsync({
        nome: data.nome,
        email: data.email,
        senha: data.senha,
        tipo_usuario: data.tipo_usuario,
        empresa_id: data.tipo_usuario === "EMPRESA" ? data.empresa_id : undefined,
        ativo: data.status === "ATIVO",
      });
      navigate(ROUTES.usuarios, {
        replace: true,
        state: { successMessage: `Usuário ${created.nome} cadastrado com sucesso.` },
      });
    } catch {
      // erro já exposto pelo `error` do useCreateUserMutation, tratado abaixo
    }
  }

  return (
    <AppLayout>
      <FormPage title="Cadastrar usuário" subtitle="Preencha os dados para criar um novo acesso à plataforma.">
        <CreateUserForm
          empresas={empresas ?? []}
          onSubmit={handleSubmit}
          onCancel={() => navigate(ROUTES.usuarios)}
          isSubmitting={isPending}
          submitError={error ? getErrorMessage(error, "Não foi possível cadastrar o usuário.") : null}
        />
      </FormPage>
    </AppLayout>
  );
}
