import { Route, Routes } from "react-router-dom";

import { LoginPage } from "@/features/auth";
import { DashboardPage } from "@/pages/DashboardPage";
import { NotFoundPage } from "@/pages/NotFoundPage";
import { ProtectedRoute } from "@/routes/ProtectedRoute";
import { PublicRoute } from "@/routes/PublicRoute";
import { ROUTES } from "@/constants/routes";

/**
 * Tabela central de rotas. Cada rota privada nova (Empresas, Diagnósticos,
 * Plano de Ação, Tarefas, Dashboard analítico, ...) entra aqui como mais um
 * <Route> dentro de <ProtectedRoute>, sem precisar mexer em nada do módulo
 * de autenticação. É o único arquivo que precisa saber que "páginas"
 * existem no sistema.
 */
export function AppRoutes() {
  return (
    <Routes>
      <Route
        path={ROUTES.login}
        element={
          <PublicRoute>
            <LoginPage />
          </PublicRoute>
        }
      />

      <Route
        path={ROUTES.dashboard}
        element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        }
      />

      {/*
        Próximos módulos (ainda sem tela, só a rota reservada):
        <Route path={ROUTES.empresas} element={<ProtectedRoute><EmpresasPage /></ProtectedRoute>} />
        <Route path={ROUTES.diagnosticos} element={<ProtectedRoute><DiagnosticosPage /></ProtectedRoute>} />
        <Route path={ROUTES.planoAcao} element={<ProtectedRoute><PlanoAcaoPage /></ProtectedRoute>} />
        <Route path={ROUTES.tarefas} element={<ProtectedRoute><TarefasPage /></ProtectedRoute>} />
      */}

      <Route path={ROUTES.notFound} element={<NotFoundPage />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
