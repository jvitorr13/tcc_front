export const evolucaoQueryKeys = {
  empresa: (empresaId: string) => ["evolucao", "empresa", empresaId] as const,
};
