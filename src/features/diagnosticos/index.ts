export { DiagnosticosListPage } from "@/features/diagnosticos/pages/DiagnosticosListPage";
export { CreateDiagnosticoPage } from "@/features/diagnosticos/pages/CreateDiagnosticoPage";
export { DiagnosticoDetalhePage } from "@/features/diagnosticos/pages/DiagnosticoDetalhePage";

export { DiagnosticosTable } from "@/features/diagnosticos/components/DiagnosticosTable";
export { CreateDiagnosticoForm } from "@/features/diagnosticos/components/CreateDiagnosticoForm";
export { PerguntaScale } from "@/features/diagnosticos/components/PerguntaScale";
export { ResultadoResumo } from "@/features/diagnosticos/components/ResultadoResumo";

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
  Pendencias,
  Pergunta,
  RegistrarRespostaInput,
  ResultadoDiagnostico,
  ResultadoPorArea,
} from "@/features/diagnosticos/types/diagnostico.types";
