import { z } from "zod";

export const createValorSchema = z.object({
  valor: z
    .string()
    .min(1, "Informe o valor")
    .refine((value) => !Number.isNaN(Number(value)), "Valor deve ser um número válido"),
  data_referencia: z.string().min(1, "Informe a data de referência"),
  observacao: z.string().optional(),
});

export type CreateValorFormData = z.infer<typeof createValorSchema>;
