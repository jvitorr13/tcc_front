import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { diagnosticoDetalhePath } from "@/constants/routes";

import { DIAGNOSTICO_STATUS_LABELS, DIAGNOSTICO_STATUS_VARIANTS } from "@/features/diagnosticos/constants/status";
import { usePerguntasQuery } from "@/features/diagnosticos/hooks/usePerguntasQuery";
import { useRespostasQuery } from "@/features/diagnosticos/hooks/useRespostasQuery";
import type { Diagnostico } from "@/features/diagnosticos/types/diagnostico.types";

export interface DiagnosticoAbertoCardProps {
  diagnostico: Diagnostico;
  /** Nome do modelo, quando dá pra saber (a EMPRESA não acessa /questionario/*). */
  modeloNome?: string;
}

/**
 * Diagnóstico em aberto da EMPRESA (PENDENTE ou EM_ANDAMENTO — no máximo um
 * por vez). O progresso "X de Y perguntas respondidas" sai das mesmas
 * chamadas da tela de responder (GET /perguntas e /respostas), então já
 * fica em cache quando ela clica em continuar.
 */
export function DiagnosticoAbertoCard({ diagnostico, modeloNome }: DiagnosticoAbertoCardProps) {
  const { data: areas } = usePerguntasQuery(diagnostico.id);
  const { data: respostas } = useRespostasQuery(diagnostico.id);

  const perguntaIds = new Set((areas ?? []).flatMap((area) => area.perguntas.map((pergunta) => pergunta.id)));
  const total = perguntaIds.size;
  const respondidas = (respostas ?? []).filter(
    (resposta) => resposta.valor !== "" && perguntaIds.has(resposta.pergunta_id),
  ).length;
  const carregado = areas !== undefined && respostas !== undefined;
  const comecou = respondidas > 0;

  return (
    <Card className="p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="font-display text-xl text-ink-900">{diagnostico.nome}</h2>
          {modeloNome && <p className="mt-0.5 text-sm text-ink-600">Modelo: {modeloNome}</p>}
        </div>
        <Badge variant={DIAGNOSTICO_STATUS_VARIANTS[diagnostico.status]}>
          {DIAGNOSTICO_STATUS_LABELS[diagnostico.status]}
        </Badge>
      </div>

      <div className="mt-5 max-w-md">
        <p className="text-sm text-ink-700">
          {carregado ? `${respondidas} de ${total} perguntas respondidas` : "Carregando progresso…"}
        </p>
        <ProgressBar
          value={total > 0 ? (respondidas / total) * 100 : 0}
          label="Progresso do diagnóstico"
          className="mt-2"
        />
      </div>

      <div className="mt-5 flex flex-wrap items-center justify-between gap-4">
        <p className="text-sm text-ink-500">Você pode sair e continuar depois. As respostas ficam salvas.</p>
        <Link
          to={diagnosticoDetalhePath(diagnostico.id, diagnostico.empresa_id)}
          className="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-lg bg-ink-900 px-4 text-sm font-medium text-white transition-colors hover:bg-ink-800"
        >
          {comecou ? "Continuar respondendo" : "Começar a responder"}
          <ArrowRight size={16} />
        </Link>
      </div>
    </Card>
  );
}
