import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { getErrorMessage } from "@/lib/get-error-message";

import { FormPage } from "@/components/layout/FormPage";
import { AppLayout } from "@/layouts/AppLayout";
import { ROUTES } from "@/constants/routes";

import { CreateModeloForm, type SaveStatusInfo } from "@/features/questionario/components/CreateModeloForm";
import { areasService } from "@/features/questionario/services/areas.service";
import { modelosService } from "@/features/questionario/services/modelos.service";
import { perguntasService } from "@/features/questionario/services/perguntas.service";
import type { CreateModeloFormData } from "@/features/questionario/schemas/create-modelo.schema";

/**
 * Não existe endpoint atômico "criar modelo com áreas e perguntas" — o
 * back-end só tem POST /modelos, POST /areas e POST /perguntas separados
 * (ver modelos/areas/perguntas.service.ts). Esta página orquestra os três
 * na ordem certa e guarda o id remoto de cada área/pergunta já salva, para
 * que clicar em "Tentar novamente" depois de uma falha não recrie o que já
 * foi criado — só retoma do primeiro item pendente.
 *
 * O formulário fica travado (campos desabilitados) assim que a primeira
 * tentativa começa: não dá pra editar nome/áreas/perguntas no meio de um
 * envio parcialmente concluído sem arriscar dessincronizar do que já foi
 * salvo no back-end.
 */
export function CreateModeloPage() {
  const navigate = useNavigate();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasAttempted, setHasAttempted] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const [modeloId, setModeloId] = useState<string | null>(null);
  const [areaStatus, setAreaStatus] = useState<Map<number, SaveStatusInfo & { remoteId?: string }>>(new Map());
  const [perguntaStatus, setPerguntaStatus] = useState<Map<string, SaveStatusInfo>>(new Map());

  function perguntaKey(areaIndex: number, perguntaIndex: number) {
    return `${areaIndex}:${perguntaIndex}`;
  }

  function setArea(areaIndex: number, info: SaveStatusInfo & { remoteId?: string }) {
    setAreaStatus((prev) => {
      const next = new Map(prev);
      next.set(areaIndex, { ...next.get(areaIndex), ...info });
      return next;
    });
  }

  function setPergunta(areaIndex: number, perguntaIndex: number, info: SaveStatusInfo) {
    setPerguntaStatus((prev) => {
      const next = new Map(prev);
      next.set(perguntaKey(areaIndex, perguntaIndex), info);
      return next;
    });
  }

  async function handleSubmit(data: CreateModeloFormData) {
    setHasAttempted(true);
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      let currentModeloId = modeloId;
      if (!currentModeloId) {
        const createdModelo = await modelosService.create({ nome: data.nome, versao: data.versao });
        currentModeloId = createdModelo.id;
        setModeloId(createdModelo.id);
      }

      for (let areaIndex = 0; areaIndex < data.areas.length; areaIndex++) {
        const areaData = data.areas[areaIndex];
        let areaRemoteId = areaStatus.get(areaIndex)?.remoteId;

        if (!areaRemoteId) {
          setArea(areaIndex, { status: "saving" });
          try {
            const createdArea = await areasService.create({
              modelo_id: currentModeloId,
              nome: areaData.nome,
              ordem: areaIndex + 1,
            });
            areaRemoteId = createdArea.id;
            setArea(areaIndex, { status: "done", remoteId: createdArea.id });
          } catch (err) {
            const message = getErrorMessage(err, "Não foi possível salvar a área.");
            setArea(areaIndex, { status: "error", error: message });
            setSubmitError(`Falha ao salvar a área "${areaData.nome}": ${message}`);
            return;
          }
        }

        for (let perguntaIndex = 0; perguntaIndex < areaData.perguntas.length; perguntaIndex++) {
          if (perguntaStatus.get(perguntaKey(areaIndex, perguntaIndex))?.status === "done") continue;

          const perguntaData = areaData.perguntas[perguntaIndex];
          setPergunta(areaIndex, perguntaIndex, { status: "saving" });
          try {
            await perguntasService.create({
              area_id: areaRemoteId,
              texto: perguntaData.texto,
              tipo: "ESCALA",
              escala_min: perguntaData.escala_min,
              escala_max: perguntaData.escala_max,
              obrigatoria: perguntaData.obrigatoria,
              peso: perguntaData.peso,
            });
            setPergunta(areaIndex, perguntaIndex, { status: "done" });
          } catch (err) {
            const message = getErrorMessage(err, "Não foi possível salvar a pergunta.");
            setPergunta(areaIndex, perguntaIndex, { status: "error", error: message });
            setSubmitError(`Falha ao salvar a pergunta ${perguntaIndex + 1} da área "${areaData.nome}": ${message}`);
            return;
          }
        }
      }

      navigate(ROUTES.questionarioModelos, {
        replace: true,
        state: {
          successMessage: `Modelo "${data.nome}" criado como rascunho. Ative-o na lista para poder usá-lo em diagnósticos.`,
        },
      });
    } catch (err) {
      setSubmitError(getErrorMessage(err, "Não foi possível criar o modelo."));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <AppLayout>
      <FormPage title="Novo modelo de diagnóstico" subtitle="Defina as áreas e perguntas que formam o questionário." width="lg">
        <CreateModeloForm
          onSubmit={handleSubmit}
          onCancel={() => navigate(ROUTES.questionarioModelos)}
          isSubmitting={isSubmitting}
          isLocked={hasAttempted}
          hasAttempted={hasAttempted}
          submitError={submitError}
          getAreaStatus={(areaIndex) => areaStatus.get(areaIndex)}
          getPerguntaStatus={(areaIndex, perguntaIndex) => perguntaStatus.get(perguntaKey(areaIndex, perguntaIndex))}
        />
      </FormPage>
    </AppLayout>
  );
}
