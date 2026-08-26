import { z } from "zod";

/**
 * Schema do formulário de criação de diagnóstico. `consultor_id` vem
 * pré-preenchido com o usuário logado (ver CreateDiagnosticoPage), mas
 * fica editável no formulário — um consultor sênior pode estar criando o
 * diagnóstico e atribuindo a outro consultor.
 */
export const createDiagnosticoSchema = z.object({
  nome: z.string().min(1, "Informe o nome do diagnóstico"),
  descricao: z.string().optional(),
  empresa_id: z.string().min(1, "Selecione a empresa"),
  consultor_id: z.string().min(1, "Selecione o consultor responsável"),
  modelo_id: z.string().min(1, "Selecione o modelo"),
});

export type CreateDiagnosticoFormData = z.infer<typeof createDiagnosticoSchema>;
