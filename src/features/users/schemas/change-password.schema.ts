import { z } from "zod";

export const changePasswordSchema = z
  .object({
    senha: z
      .string()
      .min(1, "Informe a nova senha")
      .min(6, "A senha deve ter ao menos 6 caracteres"),
    confirmarSenha: z.string().min(1, "Confirme a nova senha"),
  })
  .refine((data) => data.senha === data.confirmarSenha, {
    message: "As senhas não coincidem",
    path: ["confirmarSenha"],
  });

export type ChangePasswordFormData = z.infer<typeof changePasswordSchema>;
