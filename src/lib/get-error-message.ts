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

/**
 * Status HTTP de um erro de API, se houver. Toda decisão de FLUXO (o que
 * fazer, não o que mostrar) deve usar isto — nunca comparar o texto de
 * getErrorMessage(), que é só pra exibição e pode mudar sem aviso (ver
 * ERROS DA API, seção 1).
 */
export function getHttpStatus(error: unknown): number | undefined {
  return isAxiosError(error) ? error.response?.status : undefined;
}
