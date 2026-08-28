import { httpService } from "@/services/http.service";

import type { Area, CreateAreaInput } from "@/features/questionario/types/area.types";

/** POST /questionario/areas { modelo_id, nome, ordem } -> Area. Ver modelos.service.ts. */
const AREAS_PATH = "/questionario/areas";

export const areasService = {
  create: (input: CreateAreaInput) => httpService.create<Area, CreateAreaInput>(AREAS_PATH, input),
};
