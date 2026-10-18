export { ApontamentosListPage } from "@/features/apontamentos/pages/ApontamentosListPage";
export { EmpresaApontamentosPage } from "@/features/apontamentos/pages/EmpresaApontamentosPage";

export { ApontamentosPanel } from "@/features/apontamentos/components/ApontamentosPanel";
export { ApontamentoCard } from "@/features/apontamentos/components/ApontamentoCard";
export { ApontamentoForm } from "@/features/apontamentos/components/ApontamentoForm";

export { apontamentosService } from "@/features/apontamentos/services/apontamentos.service";
export { useApontamentosQuery } from "@/features/apontamentos/hooks/useApontamentosQuery";
export {
  useCreateApontamentoMutation,
  useDeleteApontamentoMutation,
  useUpdateApontamentoMutation,
} from "@/features/apontamentos/hooks/useApontamentoMutations";
export { useVinculosDaEmpresa } from "@/features/apontamentos/hooks/useVinculosDaEmpresa";

export { apontamentoSchema, APONTAMENTO_TEXTO_MAX } from "@/features/apontamentos/schemas/apontamento.schema";
export type { ApontamentoFormData } from "@/features/apontamentos/schemas/apontamento.schema";

export type {
  Apontamento,
  ApontamentoVisibilidade,
  ApontamentosFilters,
  CreateApontamentoInput,
  UpdateApontamentoInput,
  VinculoFixo,
  VinculoTipo,
} from "@/features/apontamentos/types/apontamento.types";
