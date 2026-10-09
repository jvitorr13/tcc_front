import { useMemo } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";

import { getErrorMessage } from "@/lib/get-error-message";

import { ErrorMessage } from "@/components/feedback/ErrorMessage";
import { Loading } from "@/components/feedback/Loading";
import { FormPage } from "@/components/layout/FormPage";
import { AppLayout } from "@/layouts/AppLayout";
import { ROUTES } from "@/constants/routes";

import { CreateModeloForm } from "@/features/questionario/components/CreateModeloForm";
import { useCreateVersaoMutation } from "@/features/questionario/hooks/useCreateVersaoMutation";
import { useModelosQuery } from "@/features/questionario/hooks/useModelosQuery";
import { useVersaoQuery } from "@/features/questionario/hooks/useVersaoQuery";
import type { CreateModeloFormData } from "@/features/questionario/schemas/create-modelo.schema";
import { getVersaoAtual } from "@/features/questionario/types/modelo.types";
import { formToAreasInput, versaoToFormData } from "@/features/questionario/utils/modelo-form";

/**
 * "Editar" um modelo = salvar uma versão nova a partir de outra (versão
 * salva nunca muda, nem as opções dela). Carrega a árvore completa da
 * versão base (GET /questionario/versoes/:id — por padrão a mais recente,
 * ou ?base=<versaoId>), abre no mesmo formulário da criação e reenvia tudo
 * em POST /questionario/modelos/:id/versoes, inclusive as `opcoes` de cada
 * pergunta. A versão nova nasce inativa — ativa-se na lista de modelos.
 */
export function NovaVersaoModeloPage() {
  const { id: modeloId } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const { data: modelos, isLoading: isLoadingModelos, isError: isErrorModelos, error: modelosError } = useModelosQuery();
  const modelo = useMemo(() => (modelos ?? []).find((item) => item.id === modeloId), [modelos, modeloId]);
  const versaoBaseId = searchParams.get("base") ?? (modelo ? getVersaoAtual(modelo)?.id : undefined);

  const {
    data: versaoBase,
    isLoading: isLoadingVersao,
    isError: isErrorVersao,
    error: versaoError,
  } = useVersaoQuery(versaoBaseId);

  const defaultValues = useMemo(
    () => (modelo && versaoBase ? versaoToFormData(modelo.nome, versaoBase) : undefined),
    [modelo, versaoBase],
  );

  const { mutateAsync, isPending, error } = useCreateVersaoMutation();

  async function handleSubmit(data: CreateModeloFormData) {
    if (!modeloId || !modelo) return;
    try {
      const created = await mutateAsync({ modeloId, input: { areas: formToAreasInput(data.areas) } });
      navigate(ROUTES.questionarioModelos, {
        replace: true,
        state: {
          successMessage: `Versão ${created.numero_versao} de "${modelo.nome}" salva como rascunho. Ative-a na lista para usá-la em novos diagnósticos.`,
        },
      });
    } catch {
      // erro já exposto pelo `error` do useCreateVersaoMutation, tratado abaixo
    }
  }

  const isLoading = isLoadingModelos || (Boolean(versaoBaseId) && isLoadingVersao);
  const loadError = isErrorModelos
    ? getErrorMessage(modelosError, "Não foi possível carregar o modelo.")
    : isErrorVersao
      ? getErrorMessage(versaoError, "Não foi possível carregar a versão base.")
      : !isLoading && !modelo
        ? "Modelo não encontrado."
        : null;

  return (
    <AppLayout>
      <FormPage
        title="Nova versão do modelo"
        subtitle={
          modelo && versaoBase
            ? `Partindo da v${versaoBase.numero_versao} de "${modelo.nome}". A versão atual não muda — as alterações viram uma versão nova.`
            : "As alterações viram uma versão nova; a versão atual não muda."
        }
        width="lg"
      >
        {isLoading && <Loading label="Carregando versão…" />}

        {loadError && (
          <>
            <ErrorMessage>{loadError}</ErrorMessage>
            <Link
              to={ROUTES.questionarioModelos}
              className="mt-4 inline-block text-sm font-medium text-ink-700 hover:text-ink-900"
            >
              Voltar para Modelos
            </Link>
          </>
        )}

        {!isLoading && !loadError && defaultValues && (
          <CreateModeloForm
            // Remonta se a base mudar — defaultValues do react-hook-form só vale no mount.
            key={versaoBase?.id}
            defaultValues={defaultValues}
            nomeReadOnly
            submitLabel="Salvar nova versão"
            onSubmit={handleSubmit}
            onCancel={() => navigate(ROUTES.questionarioModelos)}
            isSubmitting={isPending}
            submitError={error ? getErrorMessage(error, "Não foi possível salvar a nova versão.") : null}
          />
        )}
      </FormPage>
    </AppLayout>
  );
}
