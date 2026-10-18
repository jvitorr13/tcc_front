import { z } from "zod";

/** Limite de texto por nível definido para a tela (a API aceitaria até 500). */
export const OPCAO_DESCRICAO_MAX = 300;

/**
 * Descrição de um nível da escala. `valor` é a nota (vai como resposta);
 * a ordem é a posição na lista — o front não envia ordem. A API remove os
 * espaços das pontas, então validamos já "trimada". O "não pode ficar
 * vazia" fica no superRefine da pergunta, pra mensagem citar o nível.
 */

export const opcaoSchema = z.object({
  valor: z.number({ message: "Escolha o valor" }).int("Use um número inteiro"),
  descricao: z
    .string()
    .trim()
    .max(OPCAO_DESCRICAO_MAX, `Máximo de ${OPCAO_DESCRICAO_MAX} caracteres`),
});

/**
 * Cada pergunta é sempre escala (o único tipo usado hoje no sistema). Não
 * expõe um campo "tipo" no formulário; `tipo: "ESCALA"` é fixado na hora de
 * montar o payload (ver CreateModeloPage), não faz parte deste schema.
 *
 * `opcoes` é OBRIGATÓRIA: uma descrição não vazia para cada nota de
 * escala_min a escala_max, sem nota fora da faixa nem repetida (mesmas
 * regras da API, que também recusa o salvamento).
 */
export const perguntaSchema = z
  .object({
    texto: z.string().min(1, "Informe o texto da pergunta"),
    escala_min: z.number({ message: "Informe um número" }).int("Use um número inteiro").min(1, "Mínimo é 1"),
    escala_max: z.number({ message: "Informe um número" }).int("Use um número inteiro").max(10, "Máximo é 10"),
    obrigatoria: z.boolean(),
    peso: z.number({ message: "Informe um número" }).min(0, "Peso não pode ser negativo"),
    opcoes: z.array(opcaoSchema),
  })
  .refine((data) => data.escala_max > data.escala_min, {
    message: "A escala máxima deve ser maior que a mínima",
    path: ["escala_max"],
  })
  .superRefine((data, ctx) => {
    const vistos = new Set<number>();
    data.opcoes.forEach((opcao, index) => {
      if (opcao.descricao.length === 0) {
        ctx.addIssue({
          code: "custom",
          message: `Descreva o nível ${opcao.valor}`,
          path: ["opcoes", index, "descricao"],
        });
      }
      if (opcao.valor < data.escala_min || opcao.valor > data.escala_max) {
        ctx.addIssue({
          code: "custom",
          message: `O valor deve estar entre ${data.escala_min} e ${data.escala_max}`,
          path: ["opcoes", index, "valor"],
        });
      } else if (vistos.has(opcao.valor)) {
        ctx.addIssue({
          code: "custom",
          message: "Este valor já tem uma opção",
          path: ["opcoes", index, "valor"],
        });
      }
      vistos.add(opcao.valor);
    });

    const faltando: number[] = [];
    for (let nota = data.escala_min; nota <= data.escala_max; nota++) {
      if (!vistos.has(nota)) faltando.push(nota);
    }
    if (faltando.length > 0) {
      ctx.addIssue({
        code: "custom",
        message: `Falta descrever o${faltando.length === 1 ? " nível" : "s níveis"} ${faltando.join(", ")} — todos os níveis precisam estar preenchidos.`,
        path: ["opcoes"],
      });
    }
  });

export const areaSchema = z.object({
  nome: z.string().min(1, "Informe o nome da área"),
  descricao: z.string(),
  perguntas: z.array(perguntaSchema).min(1, "Adicione ao menos uma pergunta"),
});

/**
 * Sem campo `versao`: POST /questionario/modelos cria a versão 1
 * automaticamente numa transação única — não existe mais um passo
 * separado de "versão" no formulário.
 */
export const createModeloSchema = z.object({
  nome: z.string().min(1, "Informe o nome do modelo"),
  areas: z.array(areaSchema).min(1, "Adicione ao menos uma área"),
});

export type OpcaoFormData = z.infer<typeof opcaoSchema>;
export type PerguntaFormData = z.infer<typeof perguntaSchema>;
export type AreaFormData = z.infer<typeof areaSchema>;
export type CreateModeloFormData = z.infer<typeof createModeloSchema>;
