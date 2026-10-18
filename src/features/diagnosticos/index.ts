export { DiagnosticosListPage } from "@/features/diagnosticos/pages/DiagnosticosListPage";
export { CreateDiagnosticoPage } from "@/features/diagnosticos/pages/CreateDiagnosticoPage";
export { DiagnosticoDetalhePage } from "@/features/diagnosticos/pages/DiagnosticoDetalhePage";

export { DiagnosticosTable } from "@/features/diagnosticos/components/DiagnosticosTable";
export { AreaAccordion } from "@/features/diagnosticos/components/AreaAccordion";
export { CreateDiagnosticoForm } from "@/features/diagnosticos/components/CreateDiagnosticoForm";
export { LikertLegend } from "@/features/diagnosticos/components/LikertLegend";
export { PerguntaField } from "@/features/diagnosticos/components/PerguntaField";
export { PerguntaPasso } from "@/features/diagnosticos/components/PerguntaPasso";
export { DiagnosticoProgresso } from "@/features/diagnosticos/components/DiagnosticoProgresso";
export { RevisaoRespostas } from "@/features/diagnosticos/components/RevisaoRespostas";
export { DiagnosticoAbertoCard } from "@/features/diagnosticos/components/DiagnosticoAbertoCard";
export { DiagnosticoConcluidoItem } from "@/features/diagnosticos/components/DiagnosticoConcluidoItem";
export { ResultadoResumo } from "@/features/diagnosticos/components/ResultadoResumo";

export { LIKERT_LABELS } from "@/features/diagnosticos/constants/likert";

export { diagnosticosService } from "@/features/diagnosticos/services/diagnosticos.service";
export { useDiagnosticosQuery } from "@/features/diagnosticos/hooks/useDiagnosticosQuery";
export { useDiagnosticoQuery } from "@/features/diagnosticos/hooks/useDiagnosticoQuery";
export { useCreateDiagnosticoMutation } from "@/features/diagnosticos/hooks/useCreateDiagnosticoMutation";
export { useIniciarDiagnosticoMutation } from "@/features/diagnosticos/hooks/useIniciarDiagnosticoMutation";
export { usePerguntasQuery } from "@/features/diagnosticos/hooks/usePerguntasQuery";
export { useResponderPerguntaMutation } from "@/features/diagnosticos/hooks/useResponderPerguntaMutation";
export { usePendenciasQuery } from "@/features/diagnosticos/hooks/usePendenciasQuery";
export { useFinalizarDiagnosticoMutation } from "@/features/diagnosticos/hooks/useFinalizarDiagnosticoMutation";
export { useCalcularResultadoMutation } from "@/features/diagnosticos/hooks/useCalcularResultadoMutation";
export { useResultadoQuery } from "@/features/diagnosticos/hooks/useResultadoQuery";

export { createDiagnosticoSchema } from "@/features/diagnosticos/schemas/create-diagnostico.schema";
export type { CreateDiagnosticoFormData } from "@/features/diagnosticos/schemas/create-diagnostico.schema";

export type {
  AreaComPerguntas,
  CreateDiagnosticoInput,
  Diagnostico,
  DiagnosticosFilters,
  DiagnosticoStatus,
  Resposta,
  Pergunta,
  RegistrarRespostaInput,
  ResultadoDiagnostico,
  ResultadoPorArea,
  TipoPergunta,
} from "@/features/diagnosticos/types/diagnostico.types";
