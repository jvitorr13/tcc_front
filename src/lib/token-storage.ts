import { STORAGE_KEYS } from "@/constants/storage";

/**
 * Abstrai o acesso ao localStorage. Se um dia a estratégia mudar (ex: cookie
 * httpOnly setado pelo backend), só este arquivo muda — o resto do app
 * (interceptor, store, hooks) continua chamando os mesmos métodos.
 */
export const tokenStorage = {
  getAccessToken(): string | null {
    return localStorage.getItem(STORAGE_KEYS.accessToken);
  },
  getRefreshToken(): string | null {
    return localStorage.getItem(STORAGE_KEYS.refreshToken);
  },
  setTokens(accessToken: string, refreshToken?: string): void {
    localStorage.setItem(STORAGE_KEYS.accessToken, accessToken);
    if (refreshToken) {
      localStorage.setItem(STORAGE_KEYS.refreshToken, refreshToken);
    }
  },
  clear(): void {
    localStorage.removeItem(STORAGE_KEYS.accessToken);
    localStorage.removeItem(STORAGE_KEYS.refreshToken);
  },
};
