import { z } from "zod";

/**
 * Schema único para criar e editar empresa — ao contrário do usuário
 * (que tem senha só no cadastro), os campos de empresa são os mesmos nos
 * dois formulários, então um EmpresaForm reaproveita este schema para
 * ambos os modos (ver components/EmpresaForm.tsx).
 */
export const empresaSchema = z.object({
  razao_social: z.string().min(1, "Informe a razão social"),
  nome_fantasia: z.string().min(1, "Informe o nome fantasia"),
  cnpj: z
    .string()
    .min(1, "Informe o CNPJ")
    .refine((value) => value.replace(/\D/g, "").length === 14, "CNPJ deve ter 14 dígitos"),
  email: z
    .string()
    .min(1, "Informe o e-mail")
    .email("Informe um e-mail válido"),
  telefone: z.string().min(1, "Informe o telefone"),
  endereco: z.string().min(1, "Informe o endereço"),
  status: z.enum(["ATIVO", "INATIVO"]),
});

export type EmpresaFormData = z.infer<typeof empresaSchema>;
