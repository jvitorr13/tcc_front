import { QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter } from "react-router-dom";

import { ErrorBoundary } from "@/components/feedback/ErrorBoundary";
import { AuthProvider } from "@/contexts/AuthProvider";
import { queryClient } from "@/lib/query-client";
import { AppRoutes } from "@/routes/AppRoutes";

/**
 * Ordem dos provedores importa: ErrorBoundary por fora de tudo (precisa
 * sobreviver mesmo se algo abaixo falhar), depois QueryClientProvider
 * (nada depende dele), depois BrowserRouter (AuthProvider usa hooks de
 * rota como useLocation em ProtectedRoute), depois AuthProvider, e por
 * fim as rotas.
 */
export function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <AuthProvider>
            <AppRoutes />
          </AuthProvider>
        </BrowserRouter>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}
