import { STORAGE_KEYS } from "@/constants/storage";

/**
 * Abstrai o acesso ao localStorage. Se um dia a estratégia mudar (ex: cookie
 * httpOnly setado pelo backend), só este arquivo muda — o resto do app
 * (interceptor, store, hooks) continua chamando os mesmos métodos.
 *
 * Só access_token — não existe refresh token no backend (JWT de 24h, sem
 * renovação; ver auth.service.ts).
 */
export const tokenStorage = {
  getAccessToken(): string | null {
    return localStorage.getItem(STORAGE_KEYS.accessToken);
  },
  setAccessToken(accessToken: string): void {
    localStorage.setItem(STORAGE_KEYS.accessToken, accessToken);
  },
  clear(): void {
    localStorage.removeItem(STORAGE_KEYS.accessToken);
  },
};
