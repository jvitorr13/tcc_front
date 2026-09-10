import { Route, Routes } from "react-router-dom";

import { LoginPage, RegisterPage } from "@/features/auth";
import { DashboardsListPage, EmpresaDashboardPage } from "@/features/dashboard";
import { CreateDiagnosticoPage, DiagnosticoDetalhePage, DiagnosticosListPage } from "@/features/diagnosticos";
import { CreateEmpresaPage, EditEmpresaPage, EmpresasListPage } from "@/features/empresas";
import { EmpresaEvolucaoPage, EvolucoesListPage } from "@/features/evolucao";
import { CreateIndicadorPage, IndicadorDetalhePage, IndicadoresListPage } from "@/features/indicadores";
import { CreatePlanoAcaoPage, PlanoAcaoDetalhePage, PlanosAcaoListPage } from "@/features/plano-acao";
import { CreateModeloPage, ModelosListPage } from "@/features/questionario";
import { CreateUserPage, EditUserPage, ProfilePage, UsersListPage } from "@/features/users";
import { ConfiguracoesPage } from "@/pages/ConfiguracoesPage";
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
        path={ROUTES.register}
        element={
          <PublicRoute>
            <RegisterPage />
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

      <Route
        path={ROUTES.dashboards}
        element={
          <ProtectedRoute>
            <DashboardsListPage />
          </ProtectedRoute>
        }
      />

      <Route
        path={ROUTES.perfil}
        element={
          <ProtectedRoute>
            <ProfilePage />
          </ProtectedRoute>
        }
      />

      <Route
        path={ROUTES.usuarios}
        element={
          <ProtectedRoute>
            <UsersListPage />
          </ProtectedRoute>
        }
      />

      <Route
        path={ROUTES.usuariosNovo}
        element={
          <ProtectedRoute>
            <CreateUserPage />
          </ProtectedRoute>
        }
      />

      <Route
        path={ROUTES.usuariosEditar}
        element={
          <ProtectedRoute>
            <EditUserPage />
          </ProtectedRoute>
        }
      />

      <Route
        path={ROUTES.empresas}
        element={
          <ProtectedRoute>
            <EmpresasListPage />
          </ProtectedRoute>
        }
      />

      <Route
        path={ROUTES.empresasNovo}
        element={
          <ProtectedRoute>
            <CreateEmpresaPage />
          </ProtectedRoute>
        }
      />

      <Route
        path={ROUTES.empresasEditar}
        element={
          <ProtectedRoute>
            <EditEmpresaPage />
          </ProtectedRoute>
        }
      />

      <Route
        path={ROUTES.empresaDashboard}
        element={
          <ProtectedRoute>
            <EmpresaDashboardPage />
          </ProtectedRoute>
        }
      />

      <Route
        path={ROUTES.diagnosticos}
        element={
          <ProtectedRoute>
            <DiagnosticosListPage />
          </ProtectedRoute>
        }
      />

      <Route
        path={ROUTES.diagnosticosNovo}
        element={
          <ProtectedRoute>
            <CreateDiagnosticoPage />
          </ProtectedRoute>
        }
      />

      <Route
        path={ROUTES.questionarioModelos}
        element={
          <ProtectedRoute>
            <ModelosListPage />
          </ProtectedRoute>
        }
      />

      <Route
        path={ROUTES.questionarioModelosNovo}
        element={
          <ProtectedRoute>
            <CreateModeloPage />
          </ProtectedRoute>
        }
      />

      <Route
        path={ROUTES.diagnosticoDetalhe}
        element={
          <ProtectedRoute>
            <DiagnosticoDetalhePage />
          </ProtectedRoute>
        }
      />

      <Route
        path={ROUTES.planosAcao}
        element={
          <ProtectedRoute>
            <PlanosAcaoListPage />
          </ProtectedRoute>
        }
      />

      <Route
        path={ROUTES.planosAcaoNovo}
        element={
          <ProtectedRoute>
            <CreatePlanoAcaoPage />
          </ProtectedRoute>
        }
      />

      <Route
        path={ROUTES.planoAcaoDetalhe}
        element={
          <ProtectedRoute>
            <PlanoAcaoDetalhePage />
          </ProtectedRoute>
        }
      />

      <Route
        path={ROUTES.indicadores}
        element={
          <ProtectedRoute>
            <IndicadoresListPage />
          </ProtectedRoute>
        }
      />

      <Route
        path={ROUTES.indicadoresNovo}
        element={
          <ProtectedRoute>
            <CreateIndicadorPage />
          </ProtectedRoute>
        }
      />

      <Route
        path={ROUTES.indicadorDetalhe}
        element={
          <ProtectedRoute>
            <IndicadorDetalhePage />
          </ProtectedRoute>
        }
      />

      <Route
        path={ROUTES.evolucao}
        element={
          <ProtectedRoute>
            <EvolucoesListPage />
          </ProtectedRoute>
        }
      />

      <Route
        path={ROUTES.empresaEvolucao}
        element={
          <ProtectedRoute>
            <EmpresaEvolucaoPage />
          </ProtectedRoute>
        }
      />

      <Route
        path={ROUTES.configuracoes}
        element={
          <ProtectedRoute>
            <ConfiguracoesPage />
          </ProtectedRoute>
        }
      />

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
