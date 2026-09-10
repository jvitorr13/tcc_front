export const indicadoresQueryKeys = {
  all: ["indicadores"] as const,
  list: (empresaId: string) => ["indicadores", "list", empresaId] as const,
  detail: (id: string) => ["indicadores", "detail", id] as const,
  valores: (indicadorId: string) => ["indicadores", "valores", indicadorId] as const,
};
