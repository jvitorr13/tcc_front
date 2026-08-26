/**
 * Modelo de questionário de diagnóstico (internal/questionario). Por ora só
 * o necessário pra listar modelos no seletor de "Modelo" do cadastro de
 * diagnóstico — a configuração completa (criar modelo, áreas, perguntas,
 * ativar) é a próxima etapa do sistema.
 */
export interface Modelo {
  id: string;
  nome: string;
  versao: string;
}
