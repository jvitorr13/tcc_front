import { useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

import { getErrorMessage } from "@/lib/get-error-message";

import { Loading } from "@/components/feedback/Loading";
import { FormPage } from "@/components/layout/FormPage";
import { AppLayout } from "@/layouts/AppLayout";
import { ROUTES, planoAcaoDetalhePath } from "@/constants/routes";

import { useDiagnosticosQuery } from "@/features/diagnosticos";
import { useEmpresasQuery } from "@/features/empresas";

import { CreatePlanoAcaoForm } from "@/features/plano-acao/components/CreatePlanoAcaoForm";
import { useCreatePlanoAcaoMutation } from "@/features/plano-acao/hooks/useCreatePlanoAcaoMutation";
import type { CreatePlanoAcaoFormData } from "@/features/plano-acao/schemas/create-plano-acao.schema";

/**
 * Cadastro de plano de ação (POST /planos-acao). Pode chegar aqui a partir
 * da tela de resultado de um diagnóstico concluído (?diagnostico=&empresa=
 * na URL, ver o CTA "Criar plano de ação" em DiagnosticoDetalhePage), com
 * o diagnóstico já pré-selecionado.
 */
export function CreatePlanoAcaoPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const defaultDiagnosticoId = searchParams.get("diagnostico") ?? undefined;
  const defaultEmpresaId = searchParams.get("empresa") ?? undefined;

  const { data: empresas, isLoading: isLoadingEmpresas } = useEmpresasQuery();
  const empresaIds = useMemo(() => (empresas ?? []).map((empresa) => empresa.id), [empresas]);
  const { data: diagnosticos, isLoading: isLoadingDiagnosticos } = useDiagnosticosQuery(empresaIds);

  const { mutateAsync, isPending, error } = useCreatePlanoAcaoMutation();

  const isLoadingOptions = isLoadingEmpresas || isLoadingDiagnosticos;

  async function handleSubmit(data: CreatePlanoAcaoFormData) {
    try {
      const created = await mutateAsync({
        diagnostico_id: data.diagnostico_id,
        titulo: data.titulo,
        descricao: data.descricao,
      });
      navigate(planoAcaoDetalhePath(created.id), {
        replace: true,
        state: { successMessage: `Plano "${created.titulo}" criado com sucesso.` },
      });
    } catch {
      // erro já exposto pelo `error` do useCreatePlanoAcaoMutation, tratado abaixo
    }
  }

  return (
    <AppLayout>
      <FormPage title="Novo Plano de Ação" subtitle="Crie um plano de ação a partir de um diagnóstico.">
        {isLoadingOptions ? (
          <Loading label="Carregando…" />
        ) : (
          <CreatePlanoAcaoForm
            empresas={empresas ?? []}
            diagnosticos={diagnosticos ?? []}
            defaultEmpresaId={defaultEmpresaId}
            defaultDiagnosticoId={defaultDiagnosticoId}
            onSubmit={handleSubmit}
            onCancel={() => navigate(ROUTES.planosAcao)}
            isSubmitting={isPending}
            submitError={error ? getErrorMessage(error, "Não foi possível criar o plano de ação.") : null}
          />
        )}
      </FormPage>
    </AppLayout>
  );
}
