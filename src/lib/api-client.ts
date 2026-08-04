import axios, { AxiosError, type InternalAxiosRequestConfig } from "axios";

import { API_BASE_URL, API_TIMEOUT_MS } from "@/constants/api";
import { authEventBus } from "@/lib/auth-event-bus";
import { tokenStorage } from "@/lib/token-storage";
import type { ApiEnvelope } from "@/types/api";

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

// ---- Response interceptor: trata 401 tentando renovar o token ----
//
// O backend atual ainda não expõe POST /auth/refresh, mas o fluxo já fica
// pronto: quando esse endpoint existir, basta o refresh token estar
// persistido que o interceptor passa a funcionar sem nenhuma mudança nos
// componentes/hooks que consomem a API.
let isRefreshing = false;
let pendingRequests: Array<(token: string | null) => void> = [];

function resolvePendingRequests(token: string | null) {
  pendingRequests.forEach((callback) => callback(token));
  pendingRequests = [];
}

async function refreshAccessToken(): Promise<string | null> {
  const refreshToken = tokenStorage.getRefreshToken();
  if (!refreshToken) return null;

  try {
    const response = await axios.post<ApiEnvelope<{ access_token: string; refresh_token?: string }>>(
      `${API_BASE_URL}/auth/refresh`,
      { refresh_token: refreshToken },
    );
    const data = response.data.data;
    if (!data?.access_token) return null;

    tokenStorage.setTokens(data.access_token, data.refresh_token);
    return data.access_token;
  } catch {
    return null;
  }
}

interface RetriableConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as RetriableConfig | undefined;

    const isUnauthorized = error.response?.status === 401;
    const isAuthEndpoint = originalRequest?.url?.includes("/auth/");

    if (!isUnauthorized || !originalRequest || isAuthEndpoint || originalRequest._retry) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    if (isRefreshing) {
      // Já existe um refresh em andamento: espera o resultado dele em vez
      // de disparar múltiplas chamadas de refresh em paralelo.
      return new Promise((resolve, reject) => {
        pendingRequests.push((token) => {
          if (!token) {
            reject(error);
            return;
          }
          originalRequest.headers.Authorization = `Bearer ${token}`;
          resolve(apiClient(originalRequest));
        });
      });
    }

    isRefreshing = true;
    const newToken = await refreshAccessToken();
    isRefreshing = false;

    if (!newToken) {
      resolvePendingRequests(null);
      tokenStorage.clear();
      authEventBus.emit("session-expired");
      return Promise.reject(error);
    }

    resolvePendingRequests(newToken);
    originalRequest.headers.Authorization = `Bearer ${newToken}`;
    return apiClient(originalRequest);
  },
);
