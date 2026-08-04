type AuthEvent = "session-expired";
type Listener = () => void;

/**
 * Barramento de eventos minúsculo, só para o caso de "sessão expirou".
 *
 * Por quê isso existe: o interceptor do Axios (lib/api-client.ts) precisa
 * avisar o resto do app quando o refresh token falha, mas o api-client não
 * pode importar o authStore diretamente (o authStore usa o authService, que
 * usa o api-client → import circular). Publicar um evento aqui resolve isso:
 * o AuthProvider se inscreve uma vez e decide o que fazer (limpar estado,
 * redirecionar para /login).
 */
class AuthEventBus {
  private listeners = new Map<AuthEvent, Set<Listener>>();

  on(event: AuthEvent, listener: Listener): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(listener);
    return () => this.listeners.get(event)?.delete(listener);
  }

  emit(event: AuthEvent): void {
    this.listeners.get(event)?.forEach((listener) => listener());
  }
}

export const authEventBus = new AuthEventBus();
