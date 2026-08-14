import { useNavigate, useParams } from "react-router-dom";

import { getErrorMessage } from "@/lib/get-error-message";

import { ErrorMessage } from "@/components/feedback/ErrorMessage";
import { Loading } from "@/components/feedback/Loading";
import { FormPage } from "@/components/layout/FormPage";
import { AppLayout } from "@/layouts/AppLayout";
import { ROUTES } from "@/constants/routes";

import { EmpresaForm } from "@/features/empresas/components/EmpresaForm";
import { useEmpresaQuery } from "@/features/empresas/hooks/useEmpresaQuery";
import { useUpdateEmpresaMutation } from "@/features/empresas/hooks/useUpdateEmpresaMutation";
import type { EmpresaFormData } from "@/features/empresas/schemas/empresa.schema";

export function EditEmpresaPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: empresa, isLoading, isError, error: loadError } = useEmpresaQuery(id);
  const { mutateAsync, isPending, error: submitErrorObj } = useUpdateEmpresaMutation();

  async function handleSubmit(data: EmpresaFormData) {
    if (!id) return;
    try {
      await mutateAsync({
        id,
        input: {
          razao_social: data.razao_social,
          nome_fantasia: data.nome_fantasia,
          cnpj: data.cnpj,
          email: data.email,
          telefone: data.telefone,
          endereco: data.endereco,
          ativo: data.status === "ATIVO",
        },
      });
      navigate(ROUTES.empresas, {
        replace: true,
        state: { successMessage: `Empresa ${data.nome_fantasia || data.razao_social} atualizada com sucesso.` },
      });
    } catch {
      // erro já exposto pelo `submitErrorObj`, tratado abaixo
    }
  }

  return (
    <AppLayout>
      <FormPage title="Editar empresa" subtitle="Atualize os dados e o status da empresa." width="lg">
        {isLoading && <Loading label="Carregando empresa…" />}

        {isError && (
          <ErrorMessage>{getErrorMessage(loadError, "Não foi possível carregar a empresa.")}</ErrorMessage>
        )}

        {empresa && (
          <EmpresaForm
            mode="edit"
            defaultValues={{
              razao_social: empresa.razao_social,
              nome_fantasia: empresa.nome_fantasia,
              cnpj: empresa.cnpj,
              email: empresa.email,
              telefone: empresa.telefone,
              endereco: empresa.endereco,
              status: empresa.ativo ? "ATIVO" : "INATIVO",
            }}
            onSubmit={handleSubmit}
            onCancel={() => navigate(ROUTES.empresas)}
            isSubmitting={isPending}
            submitError={
              submitErrorObj ? getErrorMessage(submitErrorObj, "Não foi possível salvar as alterações.") : null
            }
          />
        )}
      </FormPage>
    </AppLayout>
  );
}
