import { useNavigate, useParams } from "react-router-dom";

import { getErrorMessage, getHttpStatus } from "@/lib/get-error-message";

import { ErrorMessage } from "@/components/feedback/ErrorMessage";
import { Loading } from "@/components/feedback/Loading";
import { FormPage } from "@/components/layout/FormPage";
import { AppLayout } from "@/layouts/AppLayout";
import { ROUTES } from "@/constants/routes";

import { useEmpresasQuery } from "@/features/empresas";
import { EditUserForm } from "@/features/users/components/EditUserForm";
import { useUpdateUserMutation } from "@/features/users/hooks/useUpdateUserMutation";
import { useUserQuery } from "@/features/users/hooks/useUserQuery";
import type { EditUserFormData } from "@/features/users/schemas/edit-user.schema";

export function EditUserPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: user, isLoading, isError, error: loadError } = useUserQuery(id);
  const { data: empresas } = useEmpresasQuery();
  const { mutateAsync, isPending, error: submitErrorObj } = useUpdateUserMutation();
  const isConflict = getHttpStatus(submitErrorObj) === 409;

  async function handleSubmit(data: EditUserFormData) {
    if (!id) return;
    try {
      await mutateAsync({
        id,
        input: {
          nome: data.nome,
          email: data.email,
          tipo_usuario: data.tipo_usuario,
          empresa_id: data.tipo_usuario === "EMPRESA" ? data.empresa_id : undefined,
          ativo: data.status === "ATIVO",
        },
      });
      navigate(ROUTES.usuarios, {
        replace: true,
        state: { successMessage: `Usuário ${data.nome} atualizado com sucesso.` },
      });
    } catch {
      // erro já exposto pelo `submitErrorObj`, tratado abaixo
    }
  }

  return (
    <AppLayout>
      <FormPage title="Editar usuário" subtitle="Atualize os dados e o status de acesso do usuário.">
        {isLoading && <Loading label="Carregando usuário…" />}

        {isError && (
          <ErrorMessage>{getErrorMessage(loadError, "Não foi possível carregar o usuário.")}</ErrorMessage>
        )}

        {user && (
          <EditUserForm
            defaultValues={{
              nome: user.nome,
              email: user.email,
              tipo_usuario: user.tipo_usuario,
              empresa_id: user.empresa_id ?? "",
              status: user.ativo ? "ATIVO" : "INATIVO",
            }}
            empresas={empresas ?? []}
            onSubmit={handleSubmit}
            onCancel={() => navigate(ROUTES.usuarios)}
            isSubmitting={isPending}
            submitError={
              submitErrorObj && !isConflict
                ? getErrorMessage(submitErrorObj, "Não foi possível salvar as alterações.")
                : null
            }
            conflictError={submitErrorObj && isConflict ? getErrorMessage(submitErrorObj) : null}
          />
        )}
      </FormPage>
    </AppLayout>
  );
}
