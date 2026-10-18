/**
 * Caminhos de rota centralizados. Nenhuma outra parte do app deve escrever
 * uma string de rota "na mão" — sempre importar daqui. Isso deixa refatorar
 * rotas seguro (o TypeScript aponta todo mundo que usa o path) e prepara o
 * terreno para os próximos módulos (empresas, diagnósticos, etc.).
 */
export const ROUTES = {
  login: "/login",
  register: "/cadastro",
  notFound: "/404",

  dashboard: "/",
  // Ponto de entrada no menu lateral: lista de empresas -> escolhe uma ->
  // cai em empresaDashboard (o dashboard em si é por empresa).
  dashboards: "/dashboards",
  perfil: "/perfil",
  usuarios: "/usuarios",
  usuariosNovo: "/usuarios/novo",
  usuariosEditar: "/usuarios/:id/editar",
  empresas: "/empresas",
  empresasNovo: "/empresas/novo",
  empresasEditar: "/empresas/:id/editar",
  empresaDashboard: "/empresas/:id/dashboard",
  empresaEvolucao: "/empresas/:id/evolucao",
  // Apontamentos ficam sempre dentro de uma empresa (só CONSULTOR) — sem item no menu.
  empresaApontamentos: "/empresas/:id/apontamentos",
  // Mesma rota pros dois perfis — CONSULTOR vê a listagem completa,
  // EMPRESA é resolvido sozinho pro próprio diagnóstico (sempre
  // user.empresa_id) e redirecionado direto pra diagnosticoDetalhe. Ver
  // DiagnosticosListPage.
  diagnosticos: "/diagnosticos",
  diagnosticosNovo: "/diagnosticos/novo",
  // Configuração de modelo/perguntas — sem entrada de menu ou botão em
  // nenhuma tela por ora (modelo é fixo pros dois perfis nesta fase);
  // rota e telas continuam existindo pra quando isso for reativado.
  questionarioModelos: "/diagnosticos/modelos",
  questionarioModelosNovo: "/diagnosticos/modelos/novo",
  // Editar modelo = salvar versão nova a partir de outra (?base=<versaoId>, padrão a mais recente).
  questionarioModeloNovaVersao: "/diagnosticos/modelos/:id/nova-versao",
  // Uma tela só, que mostra o formulário de perguntas (RASCUNHO/EM_ANDAMENTO)
  // ou o resultado (CONCLUIDO) dependendo do status do diagnóstico.
  diagnosticoDetalhe: "/diagnosticos/:id",

  planosAcao: "/planos-acao",
  planosAcaoNovo: "/planos-acao/novo",
  planoAcaoDetalhe: "/planos-acao/:id",
  indicadores: "/indicadores",
  indicadoresNovo: "/indicadores/novo",
  indicadorDetalhe: "/indicadores/:id",
  evolucao: "/evolucao",
  // Menu "Apontamentos" (substituiu Configurações): escolha da empresa pro
  // CONSULTOR, observações compartilhadas pra EMPRESA.
  apontamentos: "/apontamentos",

  // Preparado para os próximos módulos do sistema de consultoria — ainda
  // sem entrada no menu nem página própria.
  perguntas: "/perguntas",
  respostas: "/respostas",
  tarefas: "/tarefas",
} as const;

/** Resolve o path real de edição de um usuário a partir do :id da rota. */
export function usuarioEditarPath(id: string): string {
  return `/usuarios/${id}/editar`;
}

/** Resolve o path real de edição de uma empresa a partir do :id da rota. */
export function empresaEditarPath(id: string): string {
  return `/empresas/${id}/editar`;
}

/** Resolve o path real do dashboard de tarefas de uma empresa a partir do :id da rota. */
export function empresaDashboardPath(id: string): string {
  return `/empresas/${id}/dashboard`;
}

/** Resolve o path real da evolução de diagnósticos de uma empresa a partir do :id da rota. */
export function empresaEvolucaoPath(id: string): string {
  return `/empresas/${id}/evolucao`;
}

/** Resolve o path real dos apontamentos de uma empresa a partir do :id da rota. */
export function empresaApontamentosPath(id: string): string {
  return `/empresas/${id}/apontamentos`;
}

/**
 * Resolve o path real da tela de detalhe (responder/resultado) de um
 * diagnóstico. Carrega `empresa_id` na própria URL (?empresa=) porque não
 * existe GET /diagnosticos/:id no backend — a tela busca o diagnóstico
 * dentro da lista da empresa (ver useDiagnosticoQuery), então precisa
 * saber a empresa mesmo num acesso direto/refresh da página.
 */
export function diagnosticoDetalhePath(id: string, empresaId: string): string {
  return `/diagnosticos/${id}?empresa=${empresaId}`;
}

/** Resolve o path real do editor de nova versão de um modelo (base opcional; padrão: versão mais recente). */
export function modeloNovaVersaoPath(modeloId: string, baseVersaoId?: string): string {
  const path = `/diagnosticos/modelos/${modeloId}/nova-versao`;
  return baseVersaoId ? `${path}?base=${baseVersaoId}` : path;
}

/** Resolve o path real de detalhe de um plano de ação a partir do :id da rota. */
export function planoAcaoDetalhePath(id: string): string {
  return `/planos-acao/${id}`;
}

/** Resolve o path real de detalhe de um indicador a partir do :id da rota. */
export function indicadorDetalhePath(id: string): string {
  return `/indicadores/${id}`;
}
