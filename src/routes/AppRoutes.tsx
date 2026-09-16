import { Route, Routes } from "react-router-dom";

import { LoginPage, RegisterPage } from "@/features/auth";
import { NotFoundPage } from "@/pages/NotFoundPage";
import { ProtectedRoute } from "@/routes/ProtectedRoute";
import { PublicRoute } from "@/routes/PublicRoute";
import { RoleRoute } from "@/routes/RoleRoute";
import { ROUTES } from "@/constants/routes";
import { MODULES } from "@/routes/modules";

/**
 * Router construído a partir da tabela central de módulos (ver
 * routes/modules.ts) — nenhum path/elemento/perfil é hardcoded aqui, só
 * iterado. Login, cadastro e 404 ficam à parte, por não serem módulos da
 * área logada (não passam por ProtectedRoute).
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
        path={ROUTES.register}
        element={
          <PublicRoute>
            <RegisterPage />
          </PublicRoute>
        }
      />

      {MODULES.filter((module) => module.path && module.element).map((module) => {
        const Element = module.element!;
        return (
          <Route
            key={module.key}
            path={module.path}
            element={
              <ProtectedRoute>
                <RoleRoute
                  allow={module.roles === "all" ? ["CONSULTOR", "EMPRESA"] : module.roles}
                  requireOwnEmpresaId={module.requireOwnEmpresaId}
                  empresaIdSearchParam={module.empresaIdSearchParam}
                >
                  <Element />
                </RoleRoute>
              </ProtectedRoute>
            }
          />
        );
      })}

      {/*
        Próximos módulos (ainda sem tela nem entrada no menu, só a rota reservada):
        <Route path={ROUTES.perguntas} element={<ProtectedRoute><PerguntasPage /></ProtectedRoute>} />
        <Route path={ROUTES.respostas} element={<ProtectedRoute><RespostasPage /></ProtectedRoute>} />
        <Route path={ROUTES.tarefas} element={<ProtectedRoute><TarefasPage /></ProtectedRoute>} />
      */}

      <Route path={ROUTES.notFound} element={<NotFoundPage />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
