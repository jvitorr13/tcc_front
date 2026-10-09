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

import { useEmpresaQuery } from "@/features/empresas";
import { usePlanosAcaoQuery } from "@/features/plano-acao";
import { getModeloNomeDaVersao, useModelosQuery } from "@/features/questionario";

import { AreaAccordion } from "@/features/diagnosticos/components/AreaAccordion";
import { LikertLegend } from "@/features/diagnosticos/components/LikertLegend";
import { PerguntaPasso, type StatusResposta } from "@/features/diagnosticos/components/PerguntaPasso";
import { ResultadoResumo } from "@/features/diagnosticos/components/ResultadoResumo";
import { useCalcularResultadoMutation } from "@/features/diagnosticos/hooks/useCalcularResultadoMutation";
import { useDiagnosticoQuery } from "@/features/diagnosticos/hooks/useDiagnosticoQuery";
import { useFinalizarDiagnosticoMutation } from "@/features/diagnosticos/hooks/useFinalizarDiagnosticoMutation";
import { useIniciarDiagnosticoMutation } from "@/features/diagnosticos/hooks/useIniciarDiagnosticoMutation";
import { usePendenciasQuery } from "@/features/diagnosticos/hooks/usePendenciasQuery";
import { usePerguntasQuery } from "@/features/diagnosticos/hooks/usePerguntasQuery";
import { useResponderPerguntaMutation } from "@/features/diagnosticos/hooks/useResponderPerguntaMutation";
import { useRespostasQuery } from "@/features/diagnosticos/hooks/useRespostasQuery";
import { useResultadoQuery } from "@/features/diagnosticos/hooks/useResultadoQuery";
import { DIAGNOSTICO_STATUS_LABELS, DIAGNOSTICO_STATUS_VARIANTS } from "@/features/diagnosticos/constants/status";
import type { Pergunta } from "@/features/diagnosticos/types/diagnostico.types";

/**
 * Tela única de detalhe do diagnóstico: mostra as perguntas
 * (PENDENTE/EM_ANDAMENTO) ou o resultado calculado (CONCLUIDO) — o mesmo
 * lugar antes e depois de finalizar, sem navegar pra outra rota. O front
 * não calcula nada (nem média, nem maturidade); só coleta respostas e
 * exibe o que o back-end retorna.
 *
 * EMPRESA responde uma pergunta por vez (PerguntaPasso, "Pergunta X de N");
 * CONSULTOR vê todas as áreas abertas, só leitura (AreaAccordion).
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
  // GET /empresas/:id serve pros dois perfis (EMPRESA só a própria). Já a
  // lista de modelos (/questionario/*) é só CONSULTOR — a EMPRESA levaria 403.
  const { data: empresa } = useEmpresaQuery(empresaId);
  const { data: modelos } = useModelosQuery({ enabled: isConsultor });

  const iniciarMutation = useIniciarDiagnosticoMutation();
  const [iniciando, setIniciando] = useState(false);

  // Libera o diagnóstico pra empresa (RASCUNHO -> PENDENTE) sozinho se ele
  // ainda estiver em rascunho (ex: o cadastro chegou até aqui, ou uma
  // tentativa anterior falhou). Só o CONSULTOR pode iniciar — a EMPRESA nem
  // enxerga diagnósticos em RASCUNHO. Dispara uma vez por status "RASCUNHO"
  // observado.
  useEffect(() => {
    if (!isConsultor || diagnostico?.status !== "RASCUNHO") return;
    setIniciando(true);
    iniciarMutation
      .mutateAsync(diagnostico.id)
      .then(() => refetchDiagnostico())
      .finally(() => setIniciando(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isConsultor, diagnostico?.status, diagnostico?.id]);

  const isConcluido = diagnostico?.status === "CONCLUIDO";

  // Só pra decidir se mostra o CTA "Criar plano de ação" (item: aparece se
  // concluído E ainda não existe plano) — dispara só quando precisa.
  const { data: planosDoDiagnostico } = usePlanosAcaoQuery(
    isConcluido && isConsultor && diagnostico ? [{ diagnostico_id: diagnostico.id }] : [],
  );
  const jaTemPlanoDeAcao = (planosDoDiagnostico ?? []).length > 0;

  const {
    data: areas,
    isLoading: isLoadingPerguntas,
    isError: isErrorPerguntas,
    error: perguntasError,
  } = usePerguntasQuery(!isConcluido ? id : undefined);
  const { data: respostasSalvas } = useRespostasQuery(!isConcluido ? id : undefined);
  const { data: pendencias, refetch: refetchPendencias } = usePendenciasQuery(!isConcluido ? id : undefined);
  const {
    data: resultado,
    isLoading: isLoadingResultado,
    isError: isErrorResultado,
    refetch: refetchResultado,
  } = useResultadoQuery(id, isConcluido);

  const responderMutation = useResponderPerguntaMutation(id ?? "");
  const finalizarMutation = useFinalizarDiagnosticoMutation();
  const calcularResultadoMutation = useCalcularResultadoMutation();

  // pergunta_id -> valor como a API grava (sempre string). Só respostas não vazias.
  const [respostas, setRespostas] = useState<Map<string, string>>(new Map());
  // Erro 400 de POST /respostas por pergunta — mostrado junto ao campo.
  const [perguntaErrors, setPerguntaErrors] = useState<Map<string, string>>(new Map());
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
  // Passo atual da EMPRESA, contando as perguntas de todas as áreas em sequência.
  const [currentIndex, setCurrentIndex] = useState(0);

  const itens = useMemo(
    () => (areas ?? []).flatMap((area) => area.perguntas.map((pergunta) => ({ area, pergunta }))),
    [areas],
  );

  // Semeia o estado local com as respostas já gravadas (GET /respostas —
  // ex: reabrindo um diagnóstico em andamento) e abre todas as áreas — só
  // na primeira vez que perguntas E respostas chegam (casando pergunta_id
  // com perguntas[].id). "" = resposta limpa, conta como não respondida.
  const seeded = useRef(false);
  useEffect(() => {
    if (areas && respostasSalvas && !seeded.current) {
      seeded.current = true;
      const initial = new Map<string, string>();
      for (const resposta of respostasSalvas) {
        if (resposta.valor !== "") initial.set(resposta.pergunta_id, resposta.valor);
      }
      setRespostas(initial);
      // Retoma de onde parou: primeira pergunta ainda sem resposta.
      const perguntas = areas.flatMap((area) => area.perguntas);
      const primeiraSemResposta = perguntas.findIndex((pergunta) => !initial.has(pergunta.id));
      setCurrentIndex(primeiraSemResposta === -1 ? 0 : primeiraSemResposta);
      setExpandedAreaIds(new Set(areas.map((area) => area.id)));
    }
  }, [areas, respostasSalvas]);

  function toggleArea(areaId: string) {
    setExpandedAreaIds((prev) => {
      const next = new Set(prev);
      if (next.has(areaId)) next.delete(areaId);
      else next.add(areaId);
      return next;
    });
  }

  const modeloNome = useMemo(
    () => (diagnostico ? getModeloNomeDaVersao(modelos ?? [], diagnostico.modelo_versao_id) : undefined),
    [modelos, diagnostico],
  );

  function setPerguntaError(perguntaId: string, message: string | null) {
    setPerguntaErrors((prev) => {
      if (!message && !prev.has(perguntaId)) return prev;
      const next = new Map(prev);
      if (message) next.set(perguntaId, message);
      else next.delete(perguntaId);
      return next;
    });
  }

  // Perguntas a destacar depois da 1ª tentativa de finalizar: as pendências
  // do back-end (GET /pendencias — a fonte oficial) + obrigatórias que
  // ficaram sem resposta localmente desde a última consulta.
  const missingIds = useMemo(() => {
    const ids = new Set<string>();
    if (!attemptedFinalize) return ids;
    for (const pergunta of pendencias ?? []) ids.add(pergunta.id);
    for (const area of areas ?? []) {
      for (const pergunta of area.perguntas) {
        if (pergunta.obrigatoria && !respostas.has(pergunta.id)) ids.add(pergunta.id);
      }
    }
    return ids;
  }, [attemptedFinalize, pendencias, areas, respostas]);

  /**
   * Cada clique já salva na hora (POST /respostas imediato) — não espera o
   * usuário clicar em "Salvar progresso". `dirtyIds` continua existindo só
   * pra marcar o que falhou e precisa ser reenviado; no caminho feliz nunca
   * chega a ficar marcado, então "Salvar progresso" fica disabled (nada
   * pendente) exatamente como antes.
   *
   * `valor` já chega no formato da API (string). "" limpa a resposta, mas
   * só é aceito em pergunta NÃO obrigatória — numa obrigatória nem envia
   * (a API devolveria 400) e avisa no próprio campo.
   */
  function handleAnswer(pergunta: Pergunta, valor: string) {
    if (isConsultor) return;
    const perguntaId = pergunta.id;

    if (valor === "" && pergunta.obrigatoria) {
      setPerguntaError(perguntaId, "Resposta obrigatória não pode ficar vazia.");
      return;
    }

    setRespostas((prev) => {
      const next = new Map(prev);
      if (valor === "") next.delete(perguntaId);
      else next.set(perguntaId, valor);
      return next;
    });
    setPerguntaError(perguntaId, null);
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
          setPerguntaError(perguntaId, getErrorMessage(err, "Não foi possível salvar a resposta. Tente novamente."));
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
        responderMutation.mutateAsync({ pergunta_id: perguntaId, valor: respostas.get(perguntaId) ?? "" }),
      ),
    );

    const failedIds = pendentes.filter((_, index) => results[index].status === "rejected");
    results.forEach((result, index) => {
      setPerguntaError(
        pendentes[index],
        result.status === "rejected" ? getErrorMessage(result.reason, "Não foi possível salvar a resposta.") : null,
      );
    });
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
    if (isConsultor) return;

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

    const qtdPendentes = freshPendencias?.length ?? 0;
    if (qtdPendentes > 0) {
      setFinalizarError(
        `Não é possível finalizar: existem ${qtdPendentes} pergunta${qtdPendentes === 1 ? "" : "s"} obrigatória${qtdPendentes === 1 ? "" : "s"} pendente${qtdPendentes === 1 ? "" : "s"}.`,
      );
      // Leva direto à primeira pendente (e reabre as áreas delas, pela area_id).
      const pendentesIds = new Set(freshPendencias!.map((pergunta) => pergunta.id));
      const primeiraPendente = itens.findIndex((item) => pendentesIds.has(item.pergunta.id));
      if (primeiraPendente !== -1) setCurrentIndex(primeiraPendente);
      setExpandedAreaIds((prev) => new Set([...prev, ...freshPendencias!.map((pergunta) => pergunta.area_id)]));
      return;
    }

    setConfirmingFinalizar(true);
  }

  /**
   * GET /resultado pode dar 404 "diagnóstico ainda não tem resultado
   * calculado" mesmo com o diagnóstico já CONCLUIDO (o cálculo é uma etapa
   * separada, POST .../resultado, que pode não ter rodado ainda) — não é
   * erro de verdade, é um estado pendente que este botão resolve. Como o
   * diagnóstico já carregou com sucesso antes de chegarmos aqui, qualquer
   * erro nesta query só pode ser esse caso (não comparamos o texto do erro
   * pra saber disso, só o contexto: ver ERROS DA API, seção 4.5).
   */
  const [isCalculandoResultado, setIsCalculandoResultado] = useState(false);
  const [calcularResultadoError, setCalcularResultadoError] = useState<string | null>(null);

  async function handleCalcularResultado() {
    if (!id) return;
    setIsCalculandoResultado(true);
    setCalcularResultadoError(null);
    try {
      await calcularResultadoMutation.mutateAsync(id);
      await refetchResultado();
    } catch (err) {
      setCalcularResultadoError(getErrorMessage(err, "Não foi possível calcular o resultado."));
    } finally {
      setIsCalculandoResultado(false);
    }
  }

  async function handleConfirmarFinalizar() {
    if (!id || isConsultor) return;
    setConfirmingFinalizar(false);
    setFinalizarError(null);

    try {
      await finalizarMutation.mutateAsync(id);
    } catch (err) {
      // Ex.: 400 "diagnóstico precisa estar EM_ANDAMENTO" (nenhuma resposta
      // ainda) ou "existem N pergunta(s) obrigatória(s) sem resposta".
      setFinalizarError(getErrorMessage(err, "Não foi possível finalizar o diagnóstico."));
      return;
    }

    // Já está CONCLUIDO: o cálculo é outra etapa. Se falhar (ex.: 400 "não
    // possui respostas do tipo ESCALA"), a tela de concluído mostra o erro
    // e o botão "Calcular resultado" pra tentar de novo.
    try {
      await calcularResultadoMutation.mutateAsync(id);
    } catch (err) {
      setCalcularResultadoError(getErrorMessage(err, "Não foi possível calcular o resultado."));
    }
    await refetchDiagnostico();
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
        <Link to={ROUTES.diagnosticos} className="mt-4 inline-block text-sm font-medium text-ink-700 hover:text-ink-900">
          Voltar para Diagnósticos
        </Link>
      </AppLayout>
    );
  }

  const totalPerguntas = itens.length;
  const itemAtual = itens[Math.min(currentIndex, Math.max(itens.length - 1, 0))];

  function statusDaPergunta(perguntaId: string): StatusResposta {
    if (perguntaErrors.has(perguntaId)) return "error";
    if (dirtyIds.has(perguntaId)) return "saving";
    if (respostas.has(perguntaId)) return "saved";
    return "idle";
  }

  // Legenda 1-5: só pra perguntas ESCALA numéricas (sem descrição por nível).
  // EMPRESA: olha a pergunta da tela; CONSULTOR: qualquer uma da lista.
  const isEscalaNumerica = (pergunta: Pergunta) => pergunta.tipo === "ESCALA" && (pergunta.opcoes ?? []).length === 0;
  const mostrarLegenda = isConsultor
    ? itens.some((item) => isEscalaNumerica(item.pergunta))
    : Boolean(itemAtual && isEscalaNumerica(itemAtual.pergunta));
  const qtdPendencias = pendencias?.length ?? 0;
  const temPendencias = qtdPendencias > 0;

  return (
    <AppLayout>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl text-ink-900">{diagnostico.nome}</h1>
          <p className="mt-1 text-sm text-ink-600">
            Empresa: {empresa ? empresa.nome_fantasia || empresa.razao_social : "—"}
          </p>
          {modeloNome && <p className="mt-0.5 text-sm text-ink-600">Modelo: {modeloNome}</p>}
          {isConcluido && (
            <p className="mt-0.5 text-sm text-ink-600">Concluído em: {formatDate(diagnostico.data_conclusao)}</p>
          )}
        </div>

        <Badge variant={DIAGNOSTICO_STATUS_VARIANTS[diagnostico.status]}>
          {DIAGNOSTICO_STATUS_LABELS[diagnostico.status]}
        </Badge>
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

          {isErrorResultado && !isLoadingResultado && (
            <Card className="flex flex-col items-center gap-3 px-6 py-12 text-center">
              <p className="text-sm font-medium text-ink-900">Resultado ainda não calculado.</p>
              <p className="max-w-sm text-sm text-ink-600">
                {isConsultor
                  ? "O diagnóstico foi concluído, mas a empresa ainda não calculou o resultado."
                  : "O diagnóstico foi concluído, mas o cálculo do resultado ainda não rodou."}
              </p>
              {calcularResultadoError && <ErrorMessage>{calcularResultadoError}</ErrorMessage>}
              {/* POST /resultado é só EMPRESA — para o CONSULTOR daria 403. */}
              {!isConsultor && (
                <Button type="button" size="sm" onClick={handleCalcularResultado} isLoading={isCalculandoResultado}>
                  Calcular resultado
                </Button>
              )}
            </Card>
          )}

          {resultado && <ResultadoResumo resultado={resultado} />}

          {resultado && isConsultor && !jaTemPlanoDeAcao && (
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

          {mostrarLegenda && <LikertLegend />}

          {isConsultor &&
            areas?.map((area) => (
              <AreaAccordion
                key={area.id}
                area={area}
                respostas={respostas}
                expanded={expandedAreaIds.has(area.id)}
                onToggle={() => toggleArea(area.id)}
                missingIds={missingIds}
                errorsByPergunta={perguntaErrors}
                readOnly
              />
            ))}

          {!isConsultor && itemAtual && (
            <PerguntaPasso
              area={itemAtual.area}
              pergunta={itemAtual.pergunta}
              index={itens.indexOf(itemAtual)}
              total={totalPerguntas}
              value={respostas.get(itemAtual.pergunta.id)}
              onAnswer={(valor) => handleAnswer(itemAtual.pergunta, valor)}
              status={statusDaPergunta(itemAtual.pergunta.id)}
              error={perguntaErrors.get(itemAtual.pergunta.id)}
              isMissing={missingIds.has(itemAtual.pergunta.id)}
              onPrev={() => setCurrentIndex((index) => Math.max(index - 1, 0))}
              onNext={() => setCurrentIndex((index) => Math.min(index + 1, totalPerguntas - 1))}
            />
          )}

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
                    Depois de finalizar não dá mais para alterar as respostas. O resultado é calculado em seguida.
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
                        ? `Ainda ${qtdPendencias === 1 ? "existe" : "existem"} ${qtdPendencias} pergunta${qtdPendencias === 1 ? "" : "s"} obrigatória${qtdPendencias === 1 ? "" : "s"} sem resposta.`
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
