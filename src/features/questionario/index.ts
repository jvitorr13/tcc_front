export { ModelosListPage } from "@/features/questionario/pages/ModelosListPage";
export { CreateModeloPage } from "@/features/questionario/pages/CreateModeloPage";
export { NovaVersaoModeloPage } from "@/features/questionario/pages/NovaVersaoModeloPage";

export { ModelosTable } from "@/features/questionario/components/ModelosTable";
export { CreateModeloForm } from "@/features/questionario/components/CreateModeloForm";

export { modelosService } from "@/features/questionario/services/modelos.service";
export { versoesService } from "@/features/questionario/services/versoes.service";

export { useModelosQuery } from "@/features/questionario/hooks/useModelosQuery";
export { useCreateModeloMutation } from "@/features/questionario/hooks/useCreateModeloMutation";
export { useAtivarVersaoMutation } from "@/features/questionario/hooks/useAtivarVersaoMutation";
export { useVersaoQuery } from "@/features/questionario/hooks/useVersaoQuery";
export { useCreateVersaoMutation } from "@/features/questionario/hooks/useCreateVersaoMutation";

export { createModeloSchema } from "@/features/questionario/schemas/create-modelo.schema";
export type { CreateModeloFormData } from "@/features/questionario/schemas/create-modelo.schema";

export { getModeloNomeDaVersao, getVersaoAtual } from "@/features/questionario/types/modelo.types";
export type {
  Modelo,
  ModeloVersao,
  CreateModeloInput,
  CreateVersaoInput,
} from "@/features/questionario/types/modelo.types";
export type { Area, CreateAreaInput } from "@/features/questionario/types/area.types";
export type {
  PerguntaConfig,
  PerguntaOpcao,
  CreatePerguntaInput,
  CreatePerguntaOpcaoInput,
} from "@/features/questionario/types/pergunta.types";
