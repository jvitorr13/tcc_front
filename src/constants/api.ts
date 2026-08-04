/**
 * Constantes de configuração da API. Centralizadas aqui para não haver
 * strings mágicas espalhadas pelos services.
 */
export const API_BASE_URL: string =
  import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8080";

export const API_TIMEOUT_MS = 15_000;
