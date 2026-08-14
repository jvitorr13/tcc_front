import { z } from "zod";

/**
 * Schema de validação do formulário de cadastro. `confirmarSenha` só existe
 * aqui (não faz parte de RegisterCredentials, o contrato da API) — o refine
 * garante que as duas senhas batem antes do submit chegar ao service.
 */
export const registerSchema = z
  .object({
    nome: z.string().min(1, "Informe seu nome completo"),
    email: z
      .string()
      .min(1, "Informe seu e-mail")
      .email("Informe um e-mail válido"),
    senha: z
      .string()
      .min(1, "Informe sua senha")
      .min(6, "A senha deve ter ao menos 6 caracteres"),
    confirmarSenha: z.string().min(1, "Confirme sua senha"),
    tipo_usuario: z.enum(["CONSULTOR", "EMPRESA"]),
  })
  .refine((data) => data.senha === data.confirmarSenha, {
    message: "As senhas não coincidem",
    path: ["confirmarSenha"],
  });

export type RegisterFormData = z.infer<typeof registerSchema>;
