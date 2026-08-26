import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";

import { getErrorMessage } from "@/lib/get-error-message";

import { ErrorMessage } from "@/components/feedback/ErrorMessage";
import { Loading } from "@/components/feedback/Loading";
import { SuccessMessage } from "@/components/feedback/SuccessMessage";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { AppLayout } from "@/layouts/AppLayout";
import { ROUTES } from "@/constants/routes";

import { useEmpresasQuery } from "@/features/empresas";

import { PerguntaScale } from "@/features/diagnosticos/components/PerguntaScale";
import { ResultadoResumo } from "@/features/diagnosticos/components/ResultadoResumo";
import { useCalcularResultadoMutation } from "@/features/diagnosticos/hooks/useCalcularResultadoMutation";
import { useDiagnosticoQuery } from "@/features/diagnosticos/hooks/useDiagnosticoQuery";
import { useFinalizarDiagnosticoMutation } from "@/features/diagnosticos/hooks/useFinalizarDiagnosticoMutation";
import { useIniciarDiagnosticoMutation } from "@/features/diagnosticos/hooks/useIniciarDiagnosticoMutation";
import { usePendenciasQuery } from "@/features/diagnosticos/hooks/usePendenciasQuery";
import { usePerguntasQuery } from "@/features/diagnosticos/hooks/usePerguntasQuery";
import { useResponderPerguntaMutation } from "@/features/diagnosticos/hooks/useResponderPerguntaMutation";
import { useResultadoQuery } from "@/features/diagnosticos/hooks/useResultadoQuery";
import type { DiagnosticoStatus } from "@/features/diagnosticos/types/diagnostico.types";

const STATUS_LABELS: Record<DiagnosticoStatus, string> = {
  RASCUNHO: "Rascunho",
  EM_ANDAMENTO: "Em andamento",
  CONCLUIDO: "Concluído",
};

const STATUS_VARIANTS: Record<DiagnosticoStatus, "neutral" | "gold" | "success"> = {
  RASCUNHO: "neutral",
  EM_ANDAMENTO: "gold",
  CONCLUIDO: "success",
};

/**
 * Tela única de detalhe do diagnóstico: mostra o formulário de perguntas
 * (RASCUNHO/EM_ANDAMENTO) ou o resultado calculado (CONCLUIDO) — o mesmo
 * lugar antes e depois de finalizar, sem navegar pra outra rota. O front
 * não calcula nada (nem média, nem maturidade); só coleta respostas e
 * exibe o que o back-end retorna.
 */
export function DiagnosticoDetalhePage() {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const empresaId = searchParams.get("empresa") ?? undefined;

  const {
    data: diagnostico,
    isLoading: isLoadingDiagnostico,
    isError: isErrorDiagnostico,
    error: diagnosticoError,
    refetch: refetchDiagnostico,
  } = useDiagnosticoQuery(id, empresaId);
  const { data: empresas } = useEmpresasQuery();

  const iniciarMutation = useIniciarDiagnosticoMutation();
  const [iniciando, setIniciando] = useState(false);

  // Garante que o diagnóstico esteja EM_ANDAMENTO antes de mostrar as
  // perguntas — chama POST .../iniciar sozinho se ele ainda estiver
  // RASCUNHO (ex: o cadastro chegou até aqui, ou uma tentativa anterior
  // falhou). Só dispara uma vez por status "RASCUNHO" observado.
  useEffect(() => {
    if (diagnostico?.status !== "RASCUNHO") return;
    setIniciando(true);
    iniciarMutation
      .mutateAsync(diagnostico.id)
      .then(() => refetchDiagnostico())
      .finally(() => setIniciando(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [diagnostico?.status, diagnostico?.id]);

  const isConcluido = diagnostico?.status === "CONCLUIDO";

  const {
    data: areas,
    isLoading: isLoadingPerguntas,
    isError: isErrorPerguntas,
    error: perguntasError,
  } = usePerguntasQuery(!isConcluido ? id : undefined);
  const { data: pendencias, refetch: refetchPendencias } = usePendenciasQuery(!isConcluido ? id : undefined);
  const { data: resultado, isLoading: isLoadingResultado } = useResultadoQuery(id, isConcluido);

  const responderMutation = useResponderPerguntaMutation(id ?? "");
  const finalizarMutation = useFinalizarDiagnosticoMutation();
  const calcularResultadoMutation = useCalcularResultadoMutation();

  const [respostas, setRespostas] = useState<Map<string, number>>(new Map());
  const [dirtyIds, setDirtyIds] = useState<Set<string>>(new Set());
  const [isSavingProgresso, setIsSavingProgresso] = useState(false);
  const [progressoMessage, setProgressoMessage] = useState<string | null>(null);
  const [progressoError, setProgressoError] = useState<string | null>(null);
  const [finalizarError, setFinalizarError] = useState<string | null>(null);

  // Semeia o estado local com respostas já salvas antes (ex: reabrindo um
  // diagnóstico em andamento) — só na primeira vez que as perguntas chegam.
  const seeded = useRef(false);
  useEffect(() => {
    if (areas && !seeded.current) {
      seeded.current = true;
      const initial = new Map<string, number>();
      for (const area of areas) {
        for (const pergunta of area.perguntas) {
          if (pergunta.resposta_atual != null) initial.set(pergunta.id, pergunta.resposta_atual);
        }
      }
      setRespostas(initial);
    }
  }, [areas]);

  const empresa = useMemo(
    () => (empresas ?? []).find((item) => item.id === diagnostico?.empresa_id),
    [empresas, diagnostico],
  );

  function handleAnswer(perguntaId: string, valor: number) {
    setRespostas((prev) => new Map(prev).set(perguntaId, valor));
    setDirtyIds((prev) => new Set(prev).add(perguntaId));
    setProgressoMessage(null);
  }

  async function handleSalvarProgresso(): Promise<boolean> {
    const pendentes = Array.from(dirtyIds);
    if (pendentes.length === 0) return true;

    setIsSavingProgresso(true);
    setProgressoError(null);
    setProgressoMessage(null);

    const results = await Promise.allSettled(
      pendentes.map((perguntaId) =>
        responderMutation.mutateAsync({ pergunta_id: perguntaId, valor: respostas.get(perguntaId)! }),
      ),
    );

    const failedIds = pendentes.filter((_, index) => results[index].status === "rejected");
    setDirtyIds(new Set(failedIds));
    setIsSavingProgresso(false);
    await refetchPendencias();

    if (failedIds.length > 0) {
      setProgressoError(
        `${failedIds.length} resposta${failedIds.length === 1 ? "" : "s"} não ${
          failedIds.length === 1 ? "foi salva" : "foram salvas"
        }. Tente novamente.`,
      );
      return false;
    }

    setProgressoMessage("Progresso salvo.");
    return true;
  }

  async function handleFinalizar() {
    if (!id) return;
    setFinalizarError(null);

    if (dirtyIds.size > 0) {
      const saved = await handleSalvarProgresso();
      if (!saved) {
        setFinalizarError("Salve as respostas pendentes antes de finalizar.");
        return;
      }
    }

    const { data: freshPendencias } = await refetchPendencias();
    if ((freshPendencias?.quantidade ?? 0) > 0) {
      setFinalizarError("Ainda existem perguntas obrigatórias sem resposta.");
      return;
    }

    try {
      await finalizarMutation.mutateAsync(id);
      await calcularResultadoMutation.mutateAsync(id);
      await refetchDiagnostico();
    } catch (err) {
      setFinalizarError(getErrorMessage(err, "Não foi possível finalizar o diagnóstico."));
    }
  }

  if (!empresaId) {
    return (
      <AppLayout>
        <ErrorMessage>Não foi possível identificar a empresa deste diagnóstico.</ErrorMessage>
        <Link to={ROUTES.diagnosticos} className="mt-4 inline-block text-sm font-medium text-ink-700 hover:text-ink-900">
          Voltar para Diagnósticos
        </Link>
      </AppLayout>
    );
  }

  if (isLoadingDiagnostico || iniciando) {
    return (
      <AppLayout>
        <Loading label={iniciando ? "Iniciando diagnóstico…" : "Carregando diagnóstico…"} />
      </AppLayout>
    );
  }

  if (isErrorDiagnostico || !diagnostico) {
    return (
      <AppLayout>
        <ErrorMessage>{getErrorMessage(diagnosticoError, "Não foi possível carregar o diagnóstico.")}</ErrorMessage>
      </AppLayout>
    );
  }

  const totalPerguntas = (areas ?? []).reduce((sum, area) => sum + area.perguntas.length, 0);
  const temPendencias = (pendencias?.quantidade ?? 0) > 0;

  return (
    <AppLayout>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl text-ink-900">{diagnostico.nome}</h1>
          <p className="mt-1 text-sm text-ink-600">
            Empresa: {empresa ? empresa.nome_fantasia || empresa.razao_social : "—"}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Badge variant={STATUS_VARIANTS[diagnostico.status]}>{STATUS_LABELS[diagnostico.status]}</Badge>
          {!isConcluido && totalPerguntas > 0 && (
            <span className="text-sm text-ink-600">
              Progresso: {respostas.size}/{totalPerguntas} perguntas
            </span>
          )}
        </div>
      </div>

      {isConcluido ? (
        <div className="mt-6">
          {isLoadingResultado && <Loading label="Carregando resultado…" />}
          {resultado && <ResultadoResumo resultado={resultado} />}
        </div>
      ) : (
        <div className="mt-6 space-y-6">
          {isLoadingPerguntas && <Loading label="Carregando perguntas…" />}

          {isErrorPerguntas && (
            <ErrorMessage>{getErrorMessage(perguntasError, "Não foi possível carregar as perguntas.")}</ErrorMessage>
          )}

          {areas && areas.length === 0 && (
            <p className="text-sm text-ink-500">Este modelo ainda não tem perguntas cadastradas.</p>
          )}

          {areas?.map((area) => (
            <Card key={area.id} className="p-6">
              <h2 className="font-display text-lg text-ink-900">{area.nome}</h2>
              <div className="mt-2 divide-y divide-ink-900/6">
                {area.perguntas.map((pergunta) => (
                  <PerguntaScale
                    key={pergunta.id}
                    pergunta={pergunta}
                    value={respostas.get(pergunta.id)}
                    onAnswer={(valor) => handleAnswer(pergunta.id, valor)}
                  />
                ))}
              </div>
            </Card>
          ))}

          {areas && areas.length > 0 && (
            <Card className="p-6">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p className="text-sm text-ink-700">
                    {temPendencias
                      ? `Ainda ${pendencias?.quantidade === 1 ? "existe" : "existem"} ${pendencias?.quantidade} pergunta${pendencias?.quantidade === 1 ? "" : "s"} sem resposta.`
                      : "Todas as perguntas foram respondidas."}
                  </p>
                  {dirtyIds.size > 0 && (
                    <p className="mt-1 text-xs text-gold-600">
                      {dirtyIds.size} resposta{dirtyIds.size === 1 ? "" : "s"} ainda não salva
                      {dirtyIds.size === 1 ? "" : "s"}.
                    </p>
                  )}
                  {progressoMessage && <SuccessMessage className="mt-2">{progressoMessage}</SuccessMessage>}
                  {progressoError && <ErrorMessage className="mt-2">{progressoError}</ErrorMessage>}
                  {finalizarError && <ErrorMessage className="mt-2">{finalizarError}</ErrorMessage>}
                </div>

                <div className="flex gap-3">
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={handleSalvarProgresso}
                    isLoading={isSavingProgresso}
                    disabled={dirtyIds.size === 0}
                  >
                    Salvar progresso
                  </Button>
                  <Button
                    type="button"
                    onClick={handleFinalizar}
                    isLoading={finalizarMutation.isPending || calcularResultadoMutation.isPending}
                    disabled={temPendencias}
                  >
                    Finalizar diagnóstico
                  </Button>
                </div>
              </div>
            </Card>
          )}
        </div>
      )}
    </AppLayout>
  );
}
