/**
 * Pergunta como item de CONFIGURAÇÃO do modelo (POST /questionario/perguntas).
 * Não confundir com `Pergunta` de features/diagnosticos/types — aquele é a
 * mesma pergunta vista durante o preenchimento de um diagnóstico específico
 * (inclui `resposta_atual`); este é o cadastro dela dentro do modelo.
 */
export interface PerguntaConfig {
  id: string;
  area_id: string;
  texto: string;
  tipo: string;
  escala_min: number;
  escala_max: number;
  obrigatoria: boolean;
  peso: number;
}

export interface CreatePerguntaInput {
  area_id: string;
  texto: string;
  tipo: string;
  escala_min: number;
  escala_max: number;
  obrigatoria: boolean;
  peso: number;
}
