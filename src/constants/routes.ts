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

  // Preparado para os próximos módulos do sistema de consultoria.
  diagnosticos: "/diagnosticos",
  perguntas: "/perguntas",
  respostas: "/respostas",
  planoAcao: "/plano-de-acao",
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
