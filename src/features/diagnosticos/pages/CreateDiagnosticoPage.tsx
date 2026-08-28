import { useNavigate } from "react-router-dom";

import { getErrorMessage } from "@/lib/get-error-message";

import { Loading } from "@/components/feedback/Loading";
import { FormPage } from "@/components/layout/FormPage";
import { useAuth } from "@/hooks/useAuth";
import { AppLayout } from "@/layouts/AppLayout";
import { ROUTES, diagnosticoDetalhePath } from "@/constants/routes";

import { useEmpresasQuery } from "@/features/empresas";
import { useModelosQuery } from "@/features/questionario";
import { useUsersQuery } from "@/features/users";

import { CreateDiagnosticoForm } from "@/features/diagnosticos/components/CreateDiagnosticoForm";
import { useCreateDiagnosticoMutation } from "@/features/diagnosticos/hooks/useCreateDiagnosticoMutation";
import type { CreateDiagnosticoFormData } from "@/features/diagnosticos/schemas/create-diagnostico.schema";

/**
 * Cadastro do diagnóstico (POST /diagnosticos). Depois de criado, navega
 * direto para a tela de detalhe — é ela quem garante que o diagnóstico
 * fique EM_ANDAMENTO antes de mostrar as perguntas (chama POST .../iniciar
 * automaticamente se ainda estiver RASCUNHO), então esta página não
 * precisa se preocupar com essa transição.
 */
export function CreateDiagnosticoPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const { data: empresas, isLoading: isLoadingEmpresas } = useEmpresasQuery();
  const { data: modelos, isLoading: isLoadingModelos } = useModelosQuery();
  const { data: consultores, isLoading: isLoadingConsultores } = useUsersQuery({ tipo_usuario: "CONSULTOR" });
  const { mutateAsync, isPending, error } = useCreateDiagnosticoMutation();

  // Só modelos ativados (POST /modelos/:id/ativar) podem ser aplicados a um
  // diagnóstico — um modelo em rascunho pode não ter todas as perguntas
  // cadastradas ainda.
  const modelosAtivos = (modelos ?? []).filter((modelo) => modelo.ativo);

  // Só monta o formulário depois que empresas/consultores/modelos chegam:
  // o campo Consultor já nasce pré-selecionado com o usuário logado via
  // defaultValues do react-hook-form, e isso só funciona se a opção
  // correspondente já existir no <select> na primeira renderização — um
  // <select> não-controlado não re-seleciona sozinho quando uma opção
  // aparece depois do mount.
  const isLoadingOptions = isLoadingEmpresas || isLoadingModelos || isLoadingConsultores;

  async function handleSubmit(data: CreateDiagnosticoFormData) {
    try {
      const created = await mutateAsync({
        nome: data.nome,
        descricao: data.descricao,
        empresa_id: data.empresa_id,
        modelo_id: data.modelo_id,
        consultor_id: data.consultor_id,
      });
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
            consultores={consultores ?? []}
            modelos={modelosAtivos}
            defaultConsultorId={user?.id ?? ""}
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
