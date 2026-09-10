export const dashboardQueryKeys = {
  empresa: (empresaId: string) => ["dashboard", "empresa", empresaId] as const,
};
