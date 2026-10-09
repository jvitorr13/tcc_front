import { z } from "zod";

/**
 * Schema do formulário de criação de diagnóstico — espelha o body de POST
 * /diagnosticos (empresa_id + nome). Consultor (usuário do token) e modelo
 * (versão ativa) são definidos pelo back-end.
 */
export const createDiagnosticoSchema = z.object({
  nome: z.string().min(1, "Informe o nome do diagnóstico"),
  empresa_id: z.string().min(1, "Selecione a empresa"),
});

export type CreateDiagnosticoFormData = z.infer<typeof createDiagnosticoSchema>;
