/**
 * Opções de status ativo/inativo — usado tanto por usuários quanto por
 * empresas, por isso mora em constants/ (compartilhado) em vez de dentro
 * de uma feature específica.
 */
export const STATUS_OPTIONS = [
  { value: "ATIVO", label: "Ativo" },
  { value: "INATIVO", label: "Inativo" },
] as const;
