import {
  Building2,
  ClipboardList,
  Home,
  LayoutDashboard,
  NotebookPen,
  Target,
  TrendingUp,
  Users,
} from "lucide-react";
import type { ComponentType } from "react";

import { ROUTES } from "@/constants/routes";

import { ApontamentosListPage, EmpresaApontamentosPage } from "@/features/apontamentos";
import { DashboardsListPage, EmpresaDashboardPage } from "@/features/dashboard";
import { CreateDiagnosticoPage, DiagnosticoDetalhePage, DiagnosticosListPage } from "@/features/diagnosticos";
import { CreateEmpresaPage, EditEmpresaPage, EmpresasListPage } from "@/features/empresas";
import { EmpresaEvolucaoPage, EvolucoesListPage } from "@/features/evolucao";
import type { AuthUser, TipoUsuario } from "@/features/auth";
import { CreateIndicadorPage, IndicadorDetalhePage, IndicadoresListPage } from "@/features/indicadores";
import { CreatePlanoAcaoPage, PlanoAcaoDetalhePage, PlanosAcaoListPage } from "@/features/plano-acao";
import { CreateModeloPage, ModelosListPage, NovaVersaoModeloPage } from "@/features/questionario";
import { CreateUserPage, EditUserPage, ProfilePage, UsersListPage } from "@/features/users";
import { DashboardPage } from "@/pages/DashboardPage";

export interface AppModule {
  key: string;
  /** Ausente = módulo só de menu, sem <Route> própria. */
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
 * Um módulo pode ter só rota (sub-rotas tipo :id/editar, ou drill-downs
 * tipo empresa-evolucao, sem entrada no menu), ou rota + menu — mas nunca
 * duas rotas diferentes pro mesmo item de menu por perfil: quando o
 * destino depende de quem está logado, o próprio componente da rota
 * compartilhada decide o que renderizar (ver Diagnósticos e Evolução).
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
  // Apontamentos: só CONSULTOR gerencia. EMPRESA que abrir a URL é
  // redirecionada pelo RoleRoute; ela lê os compartilhados na home ("/").
  {
    key: "empresa-apontamentos",
    path: ROUTES.empresaApontamentos,
    element: EmpresaApontamentosPage,
    roles: ["CONSULTOR"],
  },

  {
    key: "dashboards",
    path: ROUTES.dashboards,
    element: DashboardsListPage,
    // Mesma rota pros dois perfis — DashboardsListPage decide: CONSULTOR
    // escolhe a empresa; EMPRESA vê direto o dashboard da própria.
    roles: "all",
    menu: {
      label: { CONSULTOR: "Dashboards", EMPRESA: "Dashboard" },
      description: "Andamento das tarefas dos planos de ação",
      icon: LayoutDashboard,
    },
  },

  // Diagnósticos: MESMA rota pros dois perfis — DiagnosticosListPage decide
  // internamente o que renderizar por tipo_usuario (listagem completa pro
  // CONSULTOR, resolução automática pro próprio diagnóstico da EMPRESA).
  // Nada de rota/tela separada aqui.
  {
    key: "diagnosticos",
    path: ROUTES.diagnosticos,
    element: DiagnosticosListPage,
    roles: "all",
    menu: {
      label: { CONSULTOR: "Diagnósticos", EMPRESA: "Diagnóstico" },
      description: "Aplicar e acompanhar diagnósticos",
      icon: ClipboardList,
    },
  },
  { key: "diagnosticos-novo", path: ROUTES.diagnosticosNovo, element: CreateDiagnosticoPage, roles: ["CONSULTOR"] },
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
    // Configuração de modelo/perguntas — sem entrada própria no menu lateral
    // (nunca teve); acessada pelo botão "Modelos de diagnóstico" dentro da
    // tela de Diagnósticos (só aparece pro CONSULTOR). EMPRESA nunca vê isso.
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
    key: "questionario-modelo-nova-versao",
    path: ROUTES.questionarioModeloNovaVersao,
    element: NovaVersaoModeloPage,
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
  // Só CONSULTOR cria plano de ação — EMPRESA só acompanha (lista/detalhe).
  { key: "planos-acao-novo", path: ROUTES.planosAcaoNovo, element: CreatePlanoAcaoPage, roles: ["CONSULTOR"] },
  { key: "plano-acao-detalhe", path: ROUTES.planoAcaoDetalhe, element: PlanoAcaoDetalhePage, roles: "all" },

  // Indicadores: módulo pronto (tela + back-end), só sem entrada no menu
  // por pedido temporário — reativar é só acrescentar `menu` aqui.
  { key: "indicadores", path: ROUTES.indicadores, element: IndicadoresListPage, roles: "all" },
  // Só CONSULTOR cria — EMPRESA só consulta os da própria empresa.
  { key: "indicadores-novo", path: ROUTES.indicadoresNovo, element: CreateIndicadorPage, roles: ["CONSULTOR"] },
  { key: "indicador-detalhe", path: ROUTES.indicadorDetalhe, element: IndicadorDetalhePage, roles: "all" },

  // Evolução: MESMA rota pros dois perfis — EvolucoesListPage decide
  // internamente o que renderizar por tipo_usuario (lista de empresas pro
  // CONSULTOR escolher, conteúdo direto da própria empresa pra EMPRESA).
  // /empresas/:id/evolucao continua existindo só como drill-down do
  // CONSULTOR (a partir da lista, ou do ícone em EmpresasTable) — EMPRESA
  // nunca precisa ir lá, já vê tudo em /evolucao.
  {
    key: "evolucao",
    path: ROUTES.evolucao,
    element: EvolucoesListPage,
    roles: "all",
    menu: { label: "Evolução", description: "Comparação de resultados ao longo do tempo", icon: TrendingUp },
  },
  {
    key: "empresa-evolucao",
    path: ROUTES.empresaEvolucao,
    element: EmpresaEvolucaoPage,
    roles: ["CONSULTOR"],
  },

  { key: "perfil", path: ROUTES.perfil, element: ProfilePage, roles: "all" },

  // Apontamentos (no lugar do antigo "Configurações", que estava em
  // construção): MESMA rota pros dois perfis — ApontamentosListPage decide.
  // CONSULTOR escolhe a empresa e vai pra /empresas/:id/apontamentos;
  // EMPRESA vê direto as observações compartilhadas com ela (só leitura).
  {
    key: "apontamentos",
    path: ROUTES.apontamentos,
    element: ApontamentosListPage,
    roles: "all",
    menu: {
      label: { CONSULTOR: "Apontamentos", EMPRESA: "Observações" },
      description: "Observações registradas sobre as empresas",
      icon: NotebookPen,
    },
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
