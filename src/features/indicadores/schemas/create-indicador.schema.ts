import { z } from "zod";

/**
 * `meta` fica como string no schema (o valor cru de um <input type="number">
 * via register(), sem valueAsNumber) — quem converte pra number ao montar o
 * payload da API é a página (ver CreateIndicadorPage), não um transform
 * aqui, pra não desalinhar o tipo usado por useForm<> do tipo que o
 * onSubmit recebe.
 */
export const createIndicadorSchema = z.object({
  empresa_id: z.string().min(1, "Selecione a empresa"),
  nome: z.string().min(2, "O nome precisa ter ao menos 2 caracteres"),
  descricao: z.string().optional(),
  unidade: z.string().min(1, "Informe a unidade"),
  meta: z
    .string()
    .optional()
    .refine((value) => !value || !Number.isNaN(Number(value)), "Meta deve ser um número válido"),
  periodicidade: z.enum(["MENSAL", "TRIMESTRAL", "SEMESTRAL", "ANUAL"]),
});

export type CreateIndicadorFormData = z.infer<typeof createIndicadorSchema>;
