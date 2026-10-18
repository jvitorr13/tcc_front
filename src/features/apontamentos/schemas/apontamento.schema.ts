import { z } from "zod";

export const APONTAMENTO_TEXTO_MAX = 2000;

/**
 * Formulário de apontamento. `texto` é validado já sem os espaços das
 * pontas (a API também remove) e contado em caracteres, como a API.
 * O vínculo é um diagnóstico OU uma tarefa; na edição ele nem é enviado
 * (só texto e visibilidade mudam).
 */
export const apontamentoSchema = z
  .object({
    texto: z
      .string()
      .trim()
      .min(1, "Escreva o apontamento")
      .max(APONTAMENTO_TEXTO_MAX, `Máximo de ${APONTAMENTO_TEXTO_MAX} caracteres`),
    compartilhar: z.boolean(),
    vinculo_tipo: z.enum(["NENHUM", "DIAGNOSTICO", "TAREFA"]),
    diagnostico_id: z.string(),
    tarefa_id: z.string(),
  })
  .superRefine((data, ctx) => {
    if (data.vinculo_tipo === "DIAGNOSTICO" && !data.diagnostico_id) {
      ctx.addIssue({ code: "custom", message: "Escolha o diagnóstico", path: ["diagnostico_id"] });
    }
    if (data.vinculo_tipo === "TAREFA" && !data.tarefa_id) {
      ctx.addIssue({ code: "custom", message: "Escolha a tarefa", path: ["tarefa_id"] });
    }
  });

export type ApontamentoFormData = z.infer<typeof apontamentoSchema>;
