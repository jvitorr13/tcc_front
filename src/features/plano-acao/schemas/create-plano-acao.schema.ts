import { z } from "zod";

export const createPlanoAcaoSchema = z.object({
  diagnostico_id: z.string().min(1, "Selecione o diagnóstico"),
  titulo: z.string().min(2, "O título precisa ter ao menos 2 caracteres"),
  descricao: z.string().optional(),
});

export type CreatePlanoAcaoFormData = z.infer<typeof createPlanoAcaoSchema>;
