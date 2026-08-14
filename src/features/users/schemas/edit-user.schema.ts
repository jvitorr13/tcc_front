import { z } from "zod";

/**
 * Schema do formulário de edição de usuário — mesmos campos do cadastro,
 * exceto senha (edição de perfil aqui não troca senha; isso seria um fluxo
 * à parte, tipo "redefinir senha").
 */
export const editUserSchema = z
  .object({
    nome: z.string().min(1, "Informe o nome completo"),
    email: z
      .string()
      .min(1, "Informe o e-mail")
      .email("Informe um e-mail válido"),
    tipo_usuario: z.enum(["CONSULTOR", "EMPRESA"]),
    empresa_id: z.string().optional(),
    status: z.enum(["ATIVO", "INATIVO"]),
  })
  .refine((data) => data.tipo_usuario !== "EMPRESA" || Boolean(data.empresa_id), {
    message: "Selecione a empresa vinculada",
    path: ["empresa_id"],
  });

export type EditUserFormData = z.infer<typeof editUserSchema>;
