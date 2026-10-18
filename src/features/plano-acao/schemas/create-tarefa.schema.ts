import { z } from "zod";

export const createTarefaSchema = z.object({
  titulo: z.string().min(1, "Informe o título da tarefa"),
  descricao: z.string().optional(),
  /** id do usuário responsável — escolhido entre os vinculados à empresa do plano. */
  responsavel_id: z.string().min(1, "Selecione o responsável"),
  prazo: z.string().optional(),
  prioridade: z.enum(["BAIXA", "MEDIA", "ALTA"]),
});

export type CreateTarefaFormData = z.infer<typeof createTarefaSchema>;
