import { ArrowRight, Target } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";

import { getErrorMessage } from "@/lib/get-error-message";

import { ErrorMessage } from "@/components/feedback/ErrorMessage";
import { Loading } from "@/components/feedback/Loading";
import { SuccessMessage } from "@/components/feedback/SuccessMessage";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { AppLayout } from "@/layouts/AppLayout";
import { useAuth } from "@/hooks/useAuth";
import { ROUTES } from "@/constants/routes";
import { formatDate } from "@/utils/format";

import { useEmpresasQuery } from "@/features/empresas";
import { useModelosQuery } from "@/features/questionario";

import { AreaAccordion } from "@/features/diagnosticos/components/AreaAccordion";
import { LikertLegend } from "@/features/diagnosticos/components/LikertLegend";
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

  // CONSULTOR só consulta/gerencia (vê progresso e resultado); quem
  // responde as perguntas e finaliza é a EMPRESA. Não é só um disabled
  // visual — handleAnswer também recusa a chamada (ver abaixo), então o
  // POST /respostas simplesmente não acontece nesse caminho de código.
  const { user } = useAuth();
  const isConsultor = user?.tipo_usuario === "CONSULTOR";

  const {
    data: diagnostico,
    isLoading: isLoadingDiagnostico,
    isError: isErrorDiagnostico,
    error: diagnosticoError,
    refetch: refetchDiagnostico,
  } = useDiagnosticoQuery(id, empresaId);
  const { data: empresas } = useEmpresasQuery();
  const { data: modelos } = useModelosQuery();

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
  const [expandedAreaIds, setExpandedAreaIds] = useState<Set<string>>(new Set());
  const [dirtyIds, setDirtyIds] = useState<Set<string>>(new Set());
  const [isSavingProgresso, setIsSavingProgresso] = useState(false);
  const [progressoMessage, setProgressoMessage] = useState<string | null>(null);
  const [progressoError, setProgressoError] = useState<string | null>(null);
  const [finalizarError, setFinalizarError] = useState<string | null>(null);
  const [isCheckingFinalizar, setIsCheckingFinalizar] = useState(false);
  const [confirmingFinalizar, setConfirmingFinalizar] = useState(false);
  // Liga o destaque "pergunta precisa ser respondida" só depois da primeira
  // tentativa de finalizar — não faz sentido pintar tudo de vermelho antes
  // do consultor sequer começar a preencher.
  const [attemptedFinalize, setAttemptedFinalize] = useState(false);

  // Semeia o estado local com respostas já salvas antes (ex: reabrindo um
  // diagnóstico em andamento) e abre todas as áreas — só na primeira vez
  // que as perguntas chegam.
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
      setExpandedAreaIds(new Set(areas.map((area) => area.id)));
    }
  }, [areas]);

  function toggleArea(areaId: string) {
    setExpandedAreaIds((prev) => {
      const next = new Set(prev);
      if (next.has(areaId)) next.delete(areaId);
      else next.add(areaId);
      return next;
    });
  }

  const empresa = useMemo(
    () => (empresas ?? []).find((item) => item.id === diagnostico?.empresa_id),
    [empresas, diagnostico],
  );
  const modelo = useMemo(
    () => (modelos ?? []).find((item) => item.id === diagnostico?.modelo_id),
    [modelos, diagnostico],
  );

  // Quais áreas têm pergunta obrigatória sem resposta — usado só pra saber
  // quais reabrir quando o consultor tenta finalizar sem terminar (a
  // contagem "oficial" de pendências continua vindo do back-end).
  const areasComPendencia = useMemo(() => {
    const ids = new Set<string>();
    for (const area of areas ?? []) {
      if (area.perguntas.some((pergunta) => pergunta.obrigatoria && !respostas.has(pergunta.id))) {
        ids.add(area.id);
      }
    }
    return ids;
  }, [areas, respostas]);

  /**
   * Cada clique já salva na hora (POST /respostas imediato) — não espera o
   * usuário clicar em "Salvar progresso". `dirtyIds` continua existindo só
   * pra marcar o que falhou e precisa ser reenviado; no caminho feliz nunca
   * chega a ficar marcado, então "Salvar progresso" fica disabled (nada
   * pendente) exatamente como antes.
   */
  function handleAnswer(perguntaId: string, valor: number) {
    if (isConsultor) return;

    setRespostas((prev) => new Map(prev).set(perguntaId, valor));
    setProgressoMessage(null);
    setProgressoError(null);
    setDirtyIds((prev) => new Set(prev).add(perguntaId));

    responderMutation.mutate(
      { pergunta_id: perguntaId, valor },
      {
        onSuccess: () => {
          setDirtyIds((prev) => {
            const next = new Set(prev);
            next.delete(perguntaId);
            return next;
          });
          refetchPendencias();
        },
        onError: (err) => {
          setProgressoError(getErrorMessage(err, "Não foi possível salvar a resposta. Tente novamente."));
        },
      },
    );
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

  /**
   * Primeiro clique em "Finalizar diagnóstico": salva o que estiver
   * pendente, confere as pendências de verdade no back-end e só then decide
   * entre bloquear (com as perguntas obrigatórias destacadas) ou pedir
   * confirmação — finalizar em si só acontece em handleConfirmarFinalizar.
   */
  async function handleFinalizarClick() {
    setFinalizarError(null);
    setAttemptedFinalize(true);
    setIsCheckingFinalizar(true);

    if (dirtyIds.size > 0) {
      const saved = await handleSalvarProgresso();
      if (!saved) {
        setFinalizarError("Salve as respostas pendentes antes de finalizar.");
        setIsCheckingFinalizar(false);
        return;
      }
    }

    const { data: freshPendencias } = await refetchPendencias();
    setIsCheckingFinalizar(false);

    if ((freshPendencias?.quantidade ?? 0) > 0) {
      setFinalizarError(
        `Não é possível finalizar: existem ${freshPendencias!.quantidade} pergunta${freshPendencias!.quantidade === 1 ? "" : "s"} obrigatória${freshPendencias!.quantidade === 1 ? "" : "s"} pendente${freshPendencias!.quantidade === 1 ? "" : "s"}.`,
      );
      setExpandedAreaIds((prev) => new Set([...prev, ...areasComPendencia]));
      return;
    }

    setConfirmingFinalizar(true);
  }

  async function handleConfirmarFinalizar() {
    if (!id) return;
    setConfirmingFinalizar(false);
    setFinalizarError(null);

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
          {modelo && <p className="mt-0.5 text-sm text-ink-600">Modelo: {modelo.nome}</p>}
          {isConcluido && (
            <p className="mt-0.5 text-sm text-ink-600">Concluído em: {formatDate(diagnostico.data_conclusao)}</p>
          )}
        </div>

        <Badge variant={STATUS_VARIANTS[diagnostico.status]}>{STATUS_LABELS[diagnostico.status]}</Badge>
      </div>

      {!isConcluido && totalPerguntas > 0 && (
        <div className="mt-4 max-w-md">
          <div className="flex items-center justify-between text-xs text-ink-600">
            <span>Progresso</span>
            <span>
              {respostas.size} de {totalPerguntas} perguntas
            </span>
          </div>
          <ProgressBar
            value={(respostas.size / totalPerguntas) * 100}
            label="Progresso do diagnóstico"
            className="mt-1.5"
          />
        </div>
      )}

      {isConcluido ? (
        <div className="mt-6 space-y-6">
          {isLoadingResultado && <Loading label="Carregando resultado…" />}
          {resultado && <ResultadoResumo resultado={resultado} />}

          {resultado && isConsultor && (
            <Card className="flex flex-wrap items-center justify-between gap-4 p-6">
              <div className="flex items-start gap-3">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-gold-100 text-gold-600">
                  <Target size={18} />
                </span>
                <div>
                  <p className="text-sm font-medium text-ink-900">Próxima etapa</p>
                  <p className="mt-0.5 text-sm text-ink-600">
                    Identifique os pontos que precisam de melhoria e crie ações para acompanhamento da empresa.
                  </p>
                </div>
              </div>
              <Link
                to={`${ROUTES.planosAcaoNovo}?diagnostico=${diagnostico.id}&empresa=${diagnostico.empresa_id}`}
                className="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-lg bg-ink-900 px-4 text-sm font-medium text-white transition-colors hover:bg-ink-800"
              >
                Criar plano de ação
                <ArrowRight size={16} />
              </Link>
            </Card>
          )}
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

          {areas && areas.length > 0 && <LikertLegend />}

          {areas?.map((area) => (
            <AreaAccordion
              key={area.id}
              area={area}
              respostas={respostas}
              onAnswer={handleAnswer}
              expanded={expandedAreaIds.has(area.id)}
              onToggle={() => toggleArea(area.id)}
              highlightUnanswered={attemptedFinalize}
              readOnly={isConsultor}
            />
          ))}

          {areas && areas.length > 0 && isConsultor && (
            <Card className="p-6">
              <p className="text-sm text-ink-700">
                {totalPerguntas > 0
                  ? `${respostas.size} de ${totalPerguntas} perguntas respondidas pela empresa.`
                  : "Aguardando a empresa responder."}
              </p>
            </Card>
          )}

          {areas && areas.length > 0 && !isConsultor && (
            <Card className="p-6">
              {confirmingFinalizar ? (
                <div>
                  <p className="text-sm font-medium text-ink-900">Finalizar diagnóstico?</p>
                  <p className="mt-1 text-sm text-ink-600">
                    Após a finalização, o diagnóstico será concluído e o resultado poderá ser calculado.
                  </p>
                  <div className="mt-4 flex gap-3">
                    <Button type="button" variant="secondary" onClick={() => setConfirmingFinalizar(false)}>
                      Cancelar
                    </Button>
                    <Button
                      type="button"
                      onClick={handleConfirmarFinalizar}
                      isLoading={finalizarMutation.isPending || calcularResultadoMutation.isPending}
                    >
                      Finalizar
                    </Button>
                  </div>
                </div>
              ) : (
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
                    <Button type="button" onClick={handleFinalizarClick} isLoading={isCheckingFinalizar}>
                      Finalizar diagnóstico
                    </Button>
                  </div>
                </div>
              )}
            </Card>
          )}
        </div>
      )}
    </AppLayout>
  );
}
