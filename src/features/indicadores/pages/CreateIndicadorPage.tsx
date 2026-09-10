import { useNavigate, useSearchParams } from "react-router-dom";

import { getErrorMessage } from "@/lib/get-error-message";

import { Loading } from "@/components/feedback/Loading";
import { FormPage } from "@/components/layout/FormPage";
import { AppLayout } from "@/layouts/AppLayout";
import { ROUTES, indicadorDetalhePath } from "@/constants/routes";

import { useEmpresasQuery } from "@/features/empresas";

import { CreateIndicadorForm } from "@/features/indicadores/components/CreateIndicadorForm";
import { useCreateIndicadorMutation } from "@/features/indicadores/hooks/useCreateIndicadorMutation";
import type { CreateIndicadorFormData } from "@/features/indicadores/schemas/create-indicador.schema";

export function CreateIndicadorPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const defaultEmpresaId = searchParams.get("empresa") ?? undefined;

  const { data: empresas, isLoading: isLoadingEmpresas } = useEmpresasQuery();
  const { mutateAsync, isPending, error } = useCreateIndicadorMutation();

  async function handleSubmit(data: CreateIndicadorFormData) {
    try {
      const created = await mutateAsync({
        empresa_id: data.empresa_id,
        nome: data.nome,
        descricao: data.descricao || undefined,
        unidade: data.unidade,
        meta: data.meta ? Number(data.meta) : undefined,
        periodicidade: data.periodicidade,
      });
      navigate(indicadorDetalhePath(created.id), {
        replace: true,
        state: { successMessage: `Indicador "${created.nome}" criado com sucesso.` },
      });
    } catch {
      // erro já exposto pelo `error` do useCreateIndicadorMutation, tratado abaixo
    }
  }

  return (
    <AppLayout>
      <FormPage title="Novo indicador" subtitle="Cadastre um indicador de desempenho para acompanhar uma empresa.">
        {isLoadingEmpresas ? (
          <Loading label="Carregando…" />
        ) : (
          <CreateIndicadorForm
            empresas={empresas ?? []}
            defaultEmpresaId={defaultEmpresaId}
            onSubmit={handleSubmit}
            onCancel={() => navigate(ROUTES.indicadores)}
            isSubmitting={isPending}
            submitError={error ? getErrorMessage(error, "Não foi possível criar o indicador.") : null}
          />
        )}
      </FormPage>
    </AppLayout>
  );
}
