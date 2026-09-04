export { PlanosAcaoListPage } from "@/features/plano-acao/pages/PlanosAcaoListPage";
export { CreatePlanoAcaoPage } from "@/features/plano-acao/pages/CreatePlanoAcaoPage";
export { PlanoAcaoDetalhePage } from "@/features/plano-acao/pages/PlanoAcaoDetalhePage";

export { PlanosAcaoTable } from "@/features/plano-acao/components/PlanosAcaoTable";
export { CreatePlanoAcaoForm } from "@/features/plano-acao/components/CreatePlanoAcaoForm";
export { CreateTarefaForm } from "@/features/plano-acao/components/CreateTarefaForm";
export { TarefaCard } from "@/features/plano-acao/components/TarefaCard";

export { planoAcaoService } from "@/features/plano-acao/services/plano-acao.service";
export { usePlanosAcaoQuery } from "@/features/plano-acao/hooks/usePlanosAcaoQuery";
export { usePlanoAcaoQuery } from "@/features/plano-acao/hooks/usePlanoAcaoQuery";
export { useCreatePlanoAcaoMutation } from "@/features/plano-acao/hooks/useCreatePlanoAcaoMutation";
export { useDeletePlanoAcaoMutation } from "@/features/plano-acao/hooks/useDeletePlanoAcaoMutation";
export { useCreateTarefaMutation } from "@/features/plano-acao/hooks/useCreateTarefaMutation";
export { useUpdateTarefaMutation } from "@/features/plano-acao/hooks/useUpdateTarefaMutation";
export { useDeleteTarefaMutation } from "@/features/plano-acao/hooks/useDeleteTarefaMutation";

export { createPlanoAcaoSchema } from "@/features/plano-acao/schemas/create-plano-acao.schema";
export type { CreatePlanoAcaoFormData } from "@/features/plano-acao/schemas/create-plano-acao.schema";
export { createTarefaSchema } from "@/features/plano-acao/schemas/create-tarefa.schema";
export type { CreateTarefaFormData } from "@/features/plano-acao/schemas/create-tarefa.schema";

export type {
  CreatePlanoAcaoInput,
  CreateTarefaInput,
  PlanoAcao,
  PlanoAcaoComTarefas,
  PlanoAcaoStatus,
  PlanosAcaoFilters,
  Tarefa,
  TarefaPrioridade,
  TarefaStatus,
  UpdatePlanoAcaoInput,
  UpdateTarefaInput,
} from "@/features/plano-acao/types/plano-acao.types";
