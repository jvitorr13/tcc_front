import { z } from "zod";

/**
 * Schema de validação do formulário de login. A mesma fonte de verdade
 * alimenta o react-hook-form (via zodResolver) e o tipo TypeScript do
 * formulário (LoginFormData), então validação e tipagem nunca ficam
 * dessincronizadas.
 */
export const loginSchema = z.object({
  email: z
    .string()
    .min(1, "Informe seu e-mail")
    .email("Informe um e-mail válido"),
  senha: z
    .string()
    .min(1, "Informe sua senha")
    .min(6, "A senha deve ter ao menos 6 caracteres"),
});

export type LoginFormData = z.infer<typeof loginSchema>;
