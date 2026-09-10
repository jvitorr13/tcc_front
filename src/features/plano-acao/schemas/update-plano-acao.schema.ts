import { z } from "zod";

export const updatePlanoAcaoSchema = z.object({
  titulo: z.string().min(2, "O título precisa ter ao menos 2 caracteres"),
  descricao: z.string().optional(),
});

export type UpdatePlanoAcaoFormData = z.infer<typeof updatePlanoAcaoSchema>;
