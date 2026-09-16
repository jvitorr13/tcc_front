import {
  Building2,
  ClipboardList,
  Home,
  LayoutDashboard,
  Settings,
  Target,
  TrendingUp,
  Users,
} from "lucide-react";
import type { ComponentType } from "react";

import { ROUTES, empresaEvolucaoPath } from "@/constants/routes";

import { DashboardsListPage, EmpresaDashboardPage } from "@/features/dashboard";
import {
  CreateDiagnosticoPage,
  DiagnosticoDetalhePage,
  DiagnosticosListPage,
  MeuDiagnosticoPage,
} from "@/features/diagnosticos";
import { CreateEmpresaPage, EditEmpresaPage, EmpresasListPage } from "@/features/empresas";
import { EmpresaEvolucaoPage, EvolucoesListPage } from "@/features/evolucao";
import type { AuthUser, TipoUsuario } from "@/features/auth";
import { CreateIndicadorPage, IndicadorDetalhePage, IndicadoresListPage } from "@/features/indicadores";
import { CreatePlanoAcaoPage, PlanoAcaoDetalhePage, PlanosAcaoListPage } from "@/features/plano-acao";
import { CreateModeloPage, ModelosListPage } from "@/features/questionario";
import { CreateUserPage, EditUserPage, ProfilePage, UsersListPage } from "@/features/users";
import { ConfiguracoesPage } from "@/pages/ConfiguracoesPage";
import { DashboardPage } from "@/pages/DashboardPage";

export interface AppModule {
  key: string;
  /** Ausente = módulo só de menu, sem <Route> própria (ver "evolucao-menu" abaixo). */
  path?: string;
  element?: ComponentType;
  /** "all" = os dois perfis (CONSULTOR e EMPRESA); array restringe explicitamente. */
  roles: TipoUsuario[] | "all";
  /** Rotas empresa-escopadas — exige que o empresa_id da URL seja o próprio empresa_id do usuário EMPRESA. */
  requireOwnEmpresaId?: boolean;
  /** Quando o empresa_id vem de querystring (ex: ?empresa=) em vez do :id do path — ver RoleRoute. */
  empresaIdSearchParam?: string;
  menu?: {
    label: string | Partial<Record<TipoUsuario, string>>;
    description?: string;
    icon: ComponentType<{ size?: number; className?: string }>;
    end?: boolean;
    /** Só precisa ser diferente de `path` quando o destino depende do usuário logado (ex: evolução da própria empresa). */
    to?: string | ((user: AuthUser) => string);
  };
}

/**
 * Fonte única de verdade de rotas + menu lateral + cards da home:
 * AppRoutes.tsx gera as <Route> daqui, Sidebar.tsx e DashboardPage.tsx
 * geram os links daqui — nenhum dos três hardcoda path/perfil por conta
 * própria. Mudar quem acessa o quê, ou o que aparece no menu, é só mexer
 * numa entrada aqui.
 *
 * Um módulo pode ter só rota (sub-rotas tipo :id/editar, sem entrada no
 * menu), só menu (ex: "evolucao-menu" — o destino muda por perfil de um
 * jeito que não é "a mesma rota pros dois", então fica separado das rotas
 * reais evolucao/empresa-evolucao), ou os dois.
 */
export const MODULES: AppModule[] = [
  {
    key: "dashboard",
    path: ROUTES.dashboard,
    element: DashboardPage,
    roles: "all",
    menu: { label: "Início", icon: Home, end: true },
  },

  {
    key: "usuarios",
    path: ROUTES.usuarios,
    element: UsersListPage,
    roles: ["CONSULTOR"],
    menu: { label: "Usuários", description: "Gerenciar consultores e empresas", icon: Users },
  },
  { key: "usuarios-novo", path: ROUTES.usuariosNovo, element: CreateUserPage, roles: ["CONSULTOR"] },
  { key: "usuarios-editar", path: ROUTES.usuariosEditar, element: EditUserPage, roles: ["CONSULTOR"] },

  {
    key: "empresas",
    path: ROUTES.empresas,
    element: EmpresasListPage,
    roles: ["CONSULTOR"],
    menu: { label: "Empresas", description: "Cadastro de empresas atendidas", icon: Building2 },
  },
  { key: "empresas-novo", path: ROUTES.empresasNovo, element: CreateEmpresaPage, roles: ["CONSULTOR"] },
  { key: "empresas-editar", path: ROUTES.empresasEditar, element: EditEmpresaPage, roles: ["CONSULTOR"] },
  { key: "empresa-dashboard", path: ROUTES.empresaDashboard, element: EmpresaDashboardPage, roles: ["CONSULTOR"] },

  {
    key: "dashboards",
    path: ROUTES.dashboards,
    element: DashboardsListPage,
    roles: ["CONSULTOR"],
    menu: { label: "Dashboards", description: "Painéis de tarefas por empresa", icon: LayoutDashboard },
  },

  // Diagnósticos: a rota real muda por perfil, igual Evolução — CONSULTOR
  // usa a listagem completa (todas as empresas, cria diagnóstico); EMPRESA
  // não tem lista nenhuma pra escolher, só a própria (resolvida sozinha por
  // MeuDiagnosticoPage a partir de user.empresa_id). Por isso o link de
  // menu é uma entrada à parte (diagnosticos-menu, mais abaixo).
  {
    key: "diagnosticos",
    path: ROUTES.diagnosticos,
    element: DiagnosticosListPage,
    roles: ["CONSULTOR"],
  },
  { key: "diagnosticos-novo", path: ROUTES.diagnosticosNovo, element: CreateDiagnosticoPage, roles: ["CONSULTOR"] },
  {
    key: "meu-diagnostico",
    path: ROUTES.meuDiagnostico,
    element: MeuDiagnosticoPage,
    roles: ["EMPRESA"],
  },
  {
    key: "diagnostico-detalhe",
    path: ROUTES.diagnosticoDetalhe,
    element: DiagnosticoDetalhePage,
    roles: "all",
    // empresa_id vem de ?empresa= nesta rota (não existe GET /diagnosticos/:id
    // no back-end — ver comentário em constants/routes.ts), não de :id.
    requireOwnEmpresaId: true,
    empresaIdSearchParam: "empresa",
  },
  {
    key: "diagnosticos-menu",
    roles: "all",
    menu: {
      label: { CONSULTOR: "Diagnósticos", EMPRESA: "Diagnóstico" },
      description: "Aplicar e acompanhar diagnósticos",
      icon: ClipboardList,
      to: (user) => (user.tipo_usuario === "EMPRESA" ? ROUTES.meuDiagnostico : ROUTES.diagnosticos),
    },
  },
  {
    // A empresa não deve visualizar a configuração do modelo de diagnóstico.
    key: "questionario-modelos",
    path: ROUTES.questionarioModelos,
    element: ModelosListPage,
    roles: ["CONSULTOR"],
  },
  {
    key: "questionario-modelos-novo",
    path: ROUTES.questionarioModelosNovo,
    element: CreateModeloPage,
    roles: ["CONSULTOR"],
  },

  {
    key: "planos-acao",
    path: ROUTES.planosAcao,
    element: PlanosAcaoListPage,
    roles: "all",
    menu: {
      label: { CONSULTOR: "Planos de Ação", EMPRESA: "Plano de Ação" },
      description: "Acompanhar planos e tarefas",
      icon: Target,
    },
  },
  { key: "planos-acao-novo", path: ROUTES.planosAcaoNovo, element: CreatePlanoAcaoPage, roles: "all" },
  { key: "plano-acao-detalhe", path: ROUTES.planoAcaoDetalhe, element: PlanoAcaoDetalhePage, roles: "all" },

  // Indicadores: módulo pronto (tela + back-end), só sem entrada no menu
  // por pedido temporário — reativar é só acrescentar `menu` aqui.
  { key: "indicadores", path: ROUTES.indicadores, element: IndicadoresListPage, roles: "all" },
  { key: "indicadores-novo", path: ROUTES.indicadoresNovo, element: CreateIndicadorPage, roles: "all" },
  { key: "indicador-detalhe", path: ROUTES.indicadorDetalhe, element: IndicadorDetalhePage, roles: "all" },

  // Evolução: a rota real muda por perfil (CONSULTOR escolhe a empresa numa
  // lista; EMPRESA só tem a própria, sem lista pra escolher) — por isso o
  // link de menu vive numa entrada à parte (evolucao-menu, mais abaixo),
  // que resolve o destino em runtime via menu.to(user).
  { key: "evolucao", path: ROUTES.evolucao, element: EvolucoesListPage, roles: ["CONSULTOR"] },
  {
    key: "empresa-evolucao",
    path: ROUTES.empresaEvolucao,
    element: EmpresaEvolucaoPage,
    roles: "all",
    requireOwnEmpresaId: true,
  },
  {
    key: "evolucao-menu",
    roles: "all",
    menu: {
      label: "Evolução",
      description: "Comparação de resultados ao longo do tempo",
      icon: TrendingUp,
      to: (user) =>
        user.tipo_usuario === "EMPRESA" && user.empresa_id ? empresaEvolucaoPath(user.empresa_id) : ROUTES.evolucao,
    },
  },

  { key: "perfil", path: ROUTES.perfil, element: ProfilePage, roles: "all" },

  {
    key: "configuracoes",
    path: ROUTES.configuracoes,
    element: ConfiguracoesPage,
    roles: "all",
    menu: { label: "Configurações", description: "Em construção", icon: Settings },
  },
];

export function isRoleAllowed(roles: TipoUsuario[] | "all", tipoUsuario: TipoUsuario): boolean {
  return roles === "all" || roles.includes(tipoUsuario);
}

export function resolveMenuLabel(
  label: string | Partial<Record<TipoUsuario, string>>,
  tipoUsuario: TipoUsuario,
): string {
  return typeof label === "string" ? label : (label[tipoUsuario] ?? "");
}

export function resolveMenuTo(
  to: string | ((user: AuthUser) => string) | undefined,
  path: string | undefined,
  user: AuthUser,
): string {
  if (typeof to === "function") return to(user);
  return to ?? path ?? ROUTES.dashboard;
}
