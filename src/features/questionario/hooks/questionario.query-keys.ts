export const modelosQueryKeys = {
  all: ["modelos"] as const,
  list: () => ["modelos", "list"] as const,
  versao: (id: string) => ["modelos", "versao", id] as const,
};
