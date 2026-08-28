export { ModelosListPage } from "@/features/questionario/pages/ModelosListPage";
export { CreateModeloPage } from "@/features/questionario/pages/CreateModeloPage";

export { ModelosTable } from "@/features/questionario/components/ModelosTable";
export { CreateModeloForm } from "@/features/questionario/components/CreateModeloForm";

export { modelosService } from "@/features/questionario/services/modelos.service";
export { areasService } from "@/features/questionario/services/areas.service";
export { perguntasService } from "@/features/questionario/services/perguntas.service";

export { useModelosQuery } from "@/features/questionario/hooks/useModelosQuery";
export { useCreateModeloMutation } from "@/features/questionario/hooks/useCreateModeloMutation";
export { useAtivarModeloMutation } from "@/features/questionario/hooks/useAtivarModeloMutation";

export { createModeloSchema } from "@/features/questionario/schemas/create-modelo.schema";
export type { CreateModeloFormData } from "@/features/questionario/schemas/create-modelo.schema";

export type { Modelo, CreateModeloInput } from "@/features/questionario/types/modelo.types";
export type { Area, CreateAreaInput } from "@/features/questionario/types/area.types";
export type { PerguntaConfig, CreatePerguntaInput } from "@/features/questionario/types/pergunta.types";
