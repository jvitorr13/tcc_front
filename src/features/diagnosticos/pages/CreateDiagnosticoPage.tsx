import { useNavigate } from "react-router-dom";

import { getErrorMessage } from "@/lib/get-error-message";

import { Loading } from "@/components/feedback/Loading";
import { FormPage } from "@/components/layout/FormPage";
import { AppLayout } from "@/layouts/AppLayout";
import { ROUTES, diagnosticoDetalhePath } from "@/constants/routes";

import { useEmpresasQuery } from "@/features/empresas";
import { getVersaoAtual, useModelosQuery } from "@/features/questionario";

import { CreateDiagnosticoForm } from "@/features/diagnosticos/components/CreateDiagnosticoForm";
import { useCreateDiagnosticoMutation } from "@/features/diagnosticos/hooks/useCreateDiagnosticoMutation";
import type { CreateDiagnosticoFormData } from "@/features/diagnosticos/schemas/create-diagnostico.schema";

/**
 * Cadastro do diagnóstico (POST /diagnosticos { empresa_id, nome }). O
 * consultor é quem está logado e o modelo é a versão ativa — ambos
 * definidos pelo back-end. Depois de criado, navega direto para a tela de
 * detalhe — é ela quem libera o diagnóstico pra empresa (chama POST
 * .../iniciar automaticamente se ainda estiver RASCUNHO).
 */
export function CreateDiagnosticoPage() {
  const navigate = useNavigate();

  const { data: empresas, isLoading: isLoadingEmpresas } = useEmpresasQuery();
  const { data: modelos, isLoading: isLoadingModelos } = useModelosQuery();
  const { mutateAsync, isPending, error } = useCreateDiagnosticoMutation();

  // O back-end aplica a versão de modelo ativa (sem ela, responde 500
  // "nenhuma versão de modelo ativa") — aqui só serve pra avisar o
  // consultor antes de enviar.
  const modeloAtivo = (modelos ?? []).find((modelo) => getVersaoAtual(modelo)?.ativo);

  const isLoadingOptions = isLoadingEmpresas || isLoadingModelos;

  async function handleSubmit(data: CreateDiagnosticoFormData) {
    try {
      const created = await mutateAsync({ empresa_id: data.empresa_id, nome: data.nome });
      navigate(diagnosticoDetalhePath(created.id, created.empresa_id), { replace: true });
    } catch {
      // erro já exposto pelo `error` do useCreateDiagnosticoMutation, tratado abaixo
    }
  }

  return (
    <AppLayout>
      <FormPage title="Novo diagnóstico" subtitle="Aplique um modelo de diagnóstico a uma empresa.">
        {isLoadingOptions ? (
          <Loading label="Carregando…" />
        ) : (
          <CreateDiagnosticoForm
            empresas={empresas ?? []}
            modeloAtivo={modeloAtivo}
            onSubmit={handleSubmit}
            onCancel={() => navigate(ROUTES.diagnosticos)}
            isSubmitting={isPending}
            submitError={error ? getErrorMessage(error, "Não foi possível criar o diagnóstico.") : null}
          />
        )}
      </FormPage>
    </AppLayout>
  );
}
