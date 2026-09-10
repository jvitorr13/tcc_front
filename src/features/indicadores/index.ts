export { IndicadoresListPage } from "@/features/indicadores/pages/IndicadoresListPage";
export { CreateIndicadorPage } from "@/features/indicadores/pages/CreateIndicadorPage";
export { IndicadorDetalhePage } from "@/features/indicadores/pages/IndicadorDetalhePage";

export { IndicadorCard } from "@/features/indicadores/components/IndicadorCard";
export { CreateIndicadorForm } from "@/features/indicadores/components/CreateIndicadorForm";
export { EditIndicadorForm } from "@/features/indicadores/components/EditIndicadorForm";
export { RegistrarMedicaoForm } from "@/features/indicadores/components/RegistrarMedicaoForm";
export { IndicadorEvolutionChart } from "@/features/indicadores/components/IndicadorEvolutionChart";
export { IndicadorValoresTable } from "@/features/indicadores/components/IndicadorValoresTable";

export { indicadoresService } from "@/features/indicadores/services/indicadores.service";
export { useIndicadoresQuery } from "@/features/indicadores/hooks/useIndicadoresQuery";
export { useIndicadorQuery } from "@/features/indicadores/hooks/useIndicadorQuery";
export { useIndicadorValoresQuery } from "@/features/indicadores/hooks/useIndicadorValoresQuery";
export { useCreateIndicadorMutation } from "@/features/indicadores/hooks/useCreateIndicadorMutation";
export { useUpdateIndicadorMutation } from "@/features/indicadores/hooks/useUpdateIndicadorMutation";
export { useDeleteIndicadorMutation } from "@/features/indicadores/hooks/useDeleteIndicadorMutation";
export { useCreateValorMutation } from "@/features/indicadores/hooks/useCreateValorMutation";

export { createIndicadorSchema } from "@/features/indicadores/schemas/create-indicador.schema";
export type { CreateIndicadorFormData } from "@/features/indicadores/schemas/create-indicador.schema";
export { updateIndicadorSchema } from "@/features/indicadores/schemas/update-indicador.schema";
export type { UpdateIndicadorFormData } from "@/features/indicadores/schemas/update-indicador.schema";
export { createValorSchema } from "@/features/indicadores/schemas/create-valor.schema";
export type { CreateValorFormData } from "@/features/indicadores/schemas/create-valor.schema";

export { PERIODICIDADE_LABELS, SITUACAO_LABELS, SITUACAO_VARIANTS } from "@/features/indicadores/constants/labels";

export type {
  CreateIndicadorInput,
  CreateIndicadorValorInput,
  Indicador,
  IndicadorPeriodicidade,
  IndicadorSituacao,
  IndicadorValor,
  UpdateIndicadorInput,
} from "@/features/indicadores/types/indicador.types";
