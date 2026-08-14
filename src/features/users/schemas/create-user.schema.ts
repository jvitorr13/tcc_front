import { z } from "zod";

/**
 * Schema do formulário de cadastro de usuário (feito por quem já está
 * logado). `status` fica como enum de UI ("ATIVO"/"INATIVO") — quem converte
 * para o `ativo: boolean` que a API espera é a página, ao montar o
 * CreateUserInput (ver CreateUserPage).
 */
export const createUserSchema = z
  .object({
    nome: z.string().min(1, "Informe o nome completo"),
    email: z
      .string()
      .min(1, "Informe o e-mail")
      .email("Informe um e-mail válido"),
    senha: z
      .string()
      .min(1, "Informe a senha")
      .min(6, "A senha deve ter ao menos 6 caracteres"),
    confirmarSenha: z.string().min(1, "Confirme a senha"),
    tipo_usuario: z.enum(["CONSULTOR", "EMPRESA"]),
    empresa_id: z.string().optional(),
    status: z.enum(["ATIVO", "INATIVO"]),
  })
  .refine((data) => data.senha === data.confirmarSenha, {
    message: "As senhas não coincidem",
    path: ["confirmarSenha"],
  })
  .refine((data) => data.tipo_usuario !== "EMPRESA" || Boolean(data.empresa_id), {
    message: "Selecione a empresa vinculada",
    path: ["empresa_id"],
  });

export type CreateUserFormData = z.infer<typeof createUserSchema>;
