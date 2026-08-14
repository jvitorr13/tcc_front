export const empresasQueryKeys = {
  all: ["empresas"] as const,
  list: () => ["empresas", "list"] as const,
  detail: (id: string) => ["empresas", "detail", id] as const,
};
