/**
 * Espelha o CompanyResponse do backend (internal/empresa).
 */
export interface Empresa {
  id: string;
  razao_social: string;
  nome_fantasia: string;
  cnpj: string;
  email: string;
  telefone: string;
  endereco: string;
  ativo: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateEmpresaInput {
  razao_social: string;
  nome_fantasia: string;
  cnpj: string;
  email: string;
  telefone: string;
  endereco: string;
  ativo: boolean;
}

export type UpdateEmpresaInput = CreateEmpresaInput;
