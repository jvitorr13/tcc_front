export const empresasQueryKeys = {
  all: ["empresas"] as const,
  list: (incluirInativas = false) => ["empresas", "list", { incluirInativas }] as const,
  detail: (id: string) => ["empresas", "detail", id] as const,
};
