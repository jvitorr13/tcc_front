import axios, { type AxiosError } from "axios";

import { API_BASE_URL, API_TIMEOUT_MS } from "@/constants/api";
import { authEventBus } from "@/lib/auth-event-bus";
import { tokenStorage } from "@/lib/token-storage";

/**
 * Instância única do Axios usada por todos os services da aplicação.
 * Nenhum service deve chamar `axios` diretamente — sempre importar daqui,
 * para garantir base URL, timeout e interceptors consistentes.
 */
export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: API_TIMEOUT_MS,
  headers: {
    "Content-Type": "application/json",
  },
});

// ---- Request interceptor: injeta o JWT em toda chamada autenticada ----
apiClient.interceptors.request.use((config) => {
  const token = tokenStorage.getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

/**
 * Response interceptor: 401 vindo de QUALQUER endpoint autenticado (não só
 * /auth/me) dispara o fluxo de "sessão expirada" — limpa o token guardado e
 * avisa o resto do app via authEventBus (ver AuthProvider, que escuta esse
 * evento e desloga). Não existe refresh token nem endpoint de renovação
 * (JWT de 24h, sem retry aqui) — quando expira, o usuário loga de novo.
 *
 * Endpoints /auth/* ficam de fora dessa regra: um 401 em POST /auth/login é
 * só "credenciais inválidas" (tratado localmente pela tela de login, com a
 * mensagem genérica exigida — nunca vira "sessão expirada"); um 401 em
 * GET /auth/me durante o boot já é tratado pelo próprio AuthProvider.
 *
 * 403 nunca passa por aqui como caso especial — é erro de permissão da
 * ação em si, não de autenticação, e segue como erro normal pra quem
 * chamou tratar.
 */
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    const isUnauthorized = error.response?.status === 401;
    const isAuthEndpoint = error.config?.url?.includes("/auth/");

    if (isUnauthorized && !isAuthEndpoint) {
      tokenStorage.clear();
      authEventBus.emit("session-expired");
    }

    return Promise.reject(error);
  },
);
