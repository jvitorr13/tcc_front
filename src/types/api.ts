/**
 * Formato padrão de resposta da API (ver pkg/response no backend Go).
 * Todo service da aplicação recebe respostas nesse envelope.
 */
export interface ApiEnvelope<T> {
  success: boolean;
  data?: T;
  error?: string;
  meta?: unknown;
}

export interface ApiPagination {
  page: number;
  page_size: number;
  total_items: number;
  total_pages: number;
}

export interface ApiListEnvelope<T> extends ApiEnvelope<T[]> {
  meta?: ApiPagination;
}

/**
 * Erro de aplicação normalizado — todo lugar que trata erro de API trabalha
 * com este formato, independente de vir do Axios, de uma validação Zod, etc.
 */
export class ApiError extends Error {
  readonly status?: number;

  constructor(message: string, status?: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}
