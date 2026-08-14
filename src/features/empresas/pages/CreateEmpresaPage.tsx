import { useNavigate } from "react-router-dom";

import { getErrorMessage } from "@/lib/get-error-message";

import { FormPage } from "@/components/layout/FormPage";
import { AppLayout } from "@/layouts/AppLayout";
import { ROUTES } from "@/constants/routes";

import { EmpresaForm } from "@/features/empresas/components/EmpresaForm";
import { useCreateEmpresaMutation } from "@/features/empresas/hooks/useCreateEmpresaMutation";
import type { EmpresaFormData } from "@/features/empresas/schemas/empresa.schema";

export function CreateEmpresaPage() {
  const navigate = useNavigate();
  const { mutateAsync, isPending, error } = useCreateEmpresaMutation();

  async function handleSubmit(data: EmpresaFormData) {
    try {
      const created = await mutateAsync({
        razao_social: data.razao_social,
        nome_fantasia: data.nome_fantasia,
        cnpj: data.cnpj,
        email: data.email,
        telefone: data.telefone,
        endereco: data.endereco,
        ativo: data.status === "ATIVO",
      });
      navigate(ROUTES.empresas, {
        replace: true,
        state: { successMessage: `Empresa ${created.nome_fantasia || created.razao_social} cadastrada com sucesso.` },
      });
    } catch {
      // erro já exposto pelo `error` do useCreateEmpresaMutation, tratado abaixo
    }
  }

  return (
    <AppLayout>
      <FormPage
        title="Cadastrar empresa"
        subtitle="Preencha os dados da empresa para vinculá-la a usuários."
        width="lg"
      >
        <EmpresaForm
          mode="create"
          onSubmit={handleSubmit}
          onCancel={() => navigate(ROUTES.empresas)}
          isSubmitting={isPending}
          submitError={error ? getErrorMessage(error, "Não foi possível cadastrar a empresa.") : null}
        />
      </FormPage>
    </AppLayout>
  );
}
