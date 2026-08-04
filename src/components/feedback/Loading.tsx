import { Spinner } from "@/components/feedback/Spinner";

export interface LoadingProps {
  label?: string;
  fullScreen?: boolean;
}

/**
 * Estado de carregamento em nível de página/seção (diferente do Spinner,
 * que é inline, ex: dentro de um botão). Usado por ProtectedRoute enquanto
 * a sessão é verificada, e por qualquer página que aguarda dados iniciais.
 */
export function Loading({ label = "Carregando…", fullScreen = false }: LoadingProps) {
  return (
    <div
      className={
        fullScreen
          ? "flex min-h-screen w-full flex-col items-center justify-center gap-3 bg-canvas"
          : "flex w-full flex-col items-center justify-center gap-3 py-16"
      }
      role="status"
      aria-live="polite"
    >
      <Spinner size="lg" className="text-ink-700" />
      <p className="text-sm text-ink-600">{label}</p>
    </div>
  );
}
