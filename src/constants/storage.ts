/**
 * Chaves usadas no localStorage. Centralizar aqui evita erros de digitação
 * e facilita trocar a estratégia de storage no futuro (ex: para cookies
 * httpOnly) mexendo em um único lugar.
 */
export const STORAGE_KEYS = {
  accessToken: "@consultoria:access_token",
  refreshToken: "@consultoria:refresh_token",
} as const;
