import { z } from "zod";

export const updateIndicadorSchema = z.object({
  nome: z.string().min(2, "O nome precisa ter ao menos 2 caracteres"),
  descricao: z.string().optional(),
  unidade: z.string().min(1, "Informe a unidade"),
  meta: z
    .string()
    .optional()
    .refine((value) => !value || !Number.isNaN(Number(value)), "Meta deve ser um número válido"),
  periodicidade: z.enum(["MENSAL", "TRIMESTRAL", "SEMESTRAL", "ANUAL"]),
});

export type UpdateIndicadorFormData = z.infer<typeof updateIndicadorSchema>;
