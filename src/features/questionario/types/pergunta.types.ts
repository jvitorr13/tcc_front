/**
 * Pergunta como item de CONFIGURAÇÃO do modelo (sempre aninhada dentro de
 * uma área, dentro de POST /questionario/modelos — ver modelos.service.ts).
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
  ordem: number;
}

/** Sem `ordem`: a posição na lista enviada é que define a ordem (ver doc do endpoint). */
export interface CreatePerguntaInput {
  texto: string;
  tipo: string;
  escala_min: number;
  escala_max: number;
  obrigatoria: boolean;
  peso: number;
}
