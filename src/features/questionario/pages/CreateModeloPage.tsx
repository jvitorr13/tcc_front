import { useNavigate } from "react-router-dom";

import { getErrorMessage, getHttpStatus } from "@/lib/get-error-message";

import { FormPage } from "@/components/layout/FormPage";
import { AppLayout } from "@/layouts/AppLayout";
import { ROUTES } from "@/constants/routes";

import { CreateModeloForm } from "@/features/questionario/components/CreateModeloForm";
import { useCreateModeloMutation } from "@/features/questionario/hooks/useCreateModeloMutation";
import type { CreateModeloFormData } from "@/features/questionario/schemas/create-modelo.schema";

/**
 * POST /questionario/modelos cria modelo + versão 1 + áreas + perguntas
 * numa transação única (ver modelos.service.ts) — um só submit, sem
 * orquestração nem retomada parcial.
 */
export function CreateModeloPage() {
  const navigate = useNavigate();
  const { mutateAsync, isPending, error } = useCreateModeloMutation();

  // 409 (nome duplicado) vira erro no campo, não banner — ver CreateModeloForm.conflictError.
  const isConflict = getHttpStatus(error) === 409;

  async function handleSubmit(data: CreateModeloFormData) {
    try {
      const created = await mutateAsync({
        nome: data.nome,
        areas: data.areas.map((area) => ({
          nome: area.nome,
          descricao: area.descricao,
          perguntas: area.perguntas.map((pergunta) => ({
            texto: pergunta.texto,
            tipo: "ESCALA",
            escala_min: pergunta.escala_min,
            escala_max: pergunta.escala_max,
            obrigatoria: pergunta.obrigatoria,
            peso: pergunta.peso,
          })),
        })),
      });
      navigate(ROUTES.questionarioModelos, {
        replace: true,
        state: {
          successMessage: `Modelo "${created.nome}" criado como rascunho. Ative-o na lista para poder usá-lo em diagnósticos.`,
        },
      });
    } catch {
      // erro já exposto pelo `error` do useCreateModeloMutation, tratado abaixo
    }
  }

  return (
    <AppLayout>
      <FormPage title="Novo modelo de diagnóstico" subtitle="Defina as áreas e perguntas que formam o questionário." width="lg">
        <CreateModeloForm
          onSubmit={handleSubmit}
          onCancel={() => navigate(ROUTES.questionarioModelos)}
          isSubmitting={isPending}
          submitError={error && !isConflict ? getErrorMessage(error, "Não foi possível criar o modelo.") : null}
          conflictError={error && isConflict ? getErrorMessage(error) : null}
        />
      </FormPage>
    </AppLayout>
  );
}
