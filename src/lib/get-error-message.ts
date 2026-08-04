import { isAxiosError } from "axios";

import type { ApiEnvelope } from "@/types/api";

/**
 * Converte qualquer erro (Axios, rede, inesperado) numa mensagem amigável
 * para exibir na UI. Usado pelos hooks de mutation de cada feature, para não
 * duplicar essa lógica de "unwrap" em cada tela.
 */
export function getErrorMessage(error: unknown, fallback = "Algo deu errado. Tente novamente."): string {
  if (isAxiosError<ApiEnvelope<unknown>>(error)) {
    const apiMessage = error.response?.data?.error;
    if (apiMessage) return apiMessage;
    if (error.code === "ECONNABORTED") return "A requisição demorou demais. Tente novamente.";
    if (!error.response) return "Não foi possível conectar ao servidor.";
  }
  if (error instanceof Error && error.message) return error.message;
  return fallback;
}
