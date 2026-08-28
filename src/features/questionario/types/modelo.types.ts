/**
 * Modelo de questionário de diagnóstico (internal/questionario). Agora cobre
 * a configuração completa: criar modelo, áreas, perguntas e ativar.
 */
export interface Modelo {
  id: string;
  nome: string;
  versao: string;
  /**
   * Assumido: o backend não documentou o nome exato do campo, mas precisa
   * existir algo pra distinguir modelo em configuração (recém-criado) de
   * modelo pronto pra uso (depois de POST /questionario/modelos/:id/ativar).
   * Segue a mesma convenção booleana de Empresa.ativo. Se o backend devolver
   * outro nome de campo, ajustar só aqui — o resto do front lê por `ativo`.
   */
  ativo: boolean;
}

export interface CreateModeloInput {
  nome: string;
  versao: string;
}
