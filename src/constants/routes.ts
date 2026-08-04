/**
 * Caminhos de rota centralizados. Nenhuma outra parte do app deve escrever
 * uma string de rota "na mão" — sempre importar daqui. Isso deixa refatorar
 * rotas seguro (o TypeScript aponta todo mundo que usa o path) e prepara o
 * terreno para os próximos módulos (empresas, diagnósticos, etc.).
 */
export const ROUTES = {
  login: "/login",
  notFound: "/404",

  dashboard: "/",

  // Preparado para os próximos módulos do sistema de consultoria.
  empresas: "/empresas",
  diagnosticos: "/diagnosticos",
  perguntas: "/perguntas",
  respostas: "/respostas",
  planoAcao: "/plano-de-acao",
  tarefas: "/tarefas",
} as const;
