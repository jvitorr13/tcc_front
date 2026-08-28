import { z } from "zod";

/**
 * Cada pergunta é sempre escala Likert (o único tipo usado hoje no sistema
 * — ver LIKERT_LABELS em features/diagnosticos). Não expõe um campo "tipo"
 * no formulário; `tipo: "ESCALA"` é fixado na hora de montar o payload
 * (ver CreateModeloPage), não faz parte deste schema.
 */
export const perguntaSchema = z
  .object({
    texto: z.string().min(1, "Informe o texto da pergunta"),
    escala_min: z.number({ message: "Informe um número" }).int("Use um número inteiro").min(1, "Mínimo é 1"),
    escala_max: z.number({ message: "Informe um número" }).int("Use um número inteiro").max(10, "Máximo é 10"),
    obrigatoria: z.boolean(),
    peso: z.number({ message: "Informe um número" }).min(0, "Peso não pode ser negativo"),
  })
  .refine((data) => data.escala_max > data.escala_min, {
    message: "A escala máxima deve ser maior que a mínima",
    path: ["escala_max"],
  });

export const areaSchema = z.object({
  nome: z.string().min(1, "Informe o nome da área"),
  perguntas: z.array(perguntaSchema).min(1, "Adicione ao menos uma pergunta"),
});

export const createModeloSchema = z.object({
  nome: z.string().min(1, "Informe o nome do modelo"),
  versao: z.string().min(1, "Informe a versão"),
  areas: z.array(areaSchema).min(1, "Adicione ao menos uma área"),
});

export type PerguntaFormData = z.infer<typeof perguntaSchema>;
export type AreaFormData = z.infer<typeof areaSchema>;
export type CreateModeloFormData = z.infer<typeof createModeloSchema>;
