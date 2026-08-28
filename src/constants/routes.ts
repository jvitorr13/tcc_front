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
  usuarios: "/usuarios",
  usuariosNovo: "/usuarios/novo",
  usuariosEditar: "/usuarios/:id/editar",
  empresas: "/empresas",
  empresasNovo: "/empresas/novo",
  empresasEditar: "/empresas/:id/editar",
  diagnosticos: "/diagnosticos",
  diagnosticosNovo: "/diagnosticos/novo",
  // Subárea de Diagnósticos, não um módulo próprio no menu lateral — ver
  // Sidebar.tsx e o botão "Modelos de diagnóstico" em DiagnosticosListPage.
  questionarioModelos: "/diagnosticos/modelos",
  questionarioModelosNovo: "/diagnosticos/modelos/novo",
  // Uma tela só, que mostra o formulário de perguntas (RASCUNHO/EM_ANDAMENTO)
  // ou o resultado (CONCLUIDO) dependendo do status do diagnóstico.
  diagnosticoDetalhe: "/diagnosticos/:id",

  planoAcao: "/plano-de-acao",
  indicadores: "/indicadores",
  configuracoes: "/configuracoes",

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
