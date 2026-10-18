/**
 * Pergunta como item de CONFIGURAÇÃO do modelo (sempre aninhada dentro de
 * uma área, dentro de POST /questionario/modelos — ver modelos.service.ts).
 * Não confundir com `Pergunta` de features/diagnosticos/types — aquele é a
 * mesma pergunta vista durante o preenchimento de um diagnóstico específico
 * (com obrigatoriedade/escala do diagnóstico); este é o cadastro dela dentro do modelo.
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
  /** Uma descrição por nível, sempre presente na leitura ([] só em modelo antigo, a completar no editor). */
  opcoes: PerguntaOpcao[];
}

/**
 * Frase de uma nota numa pergunta ESCALA. Faz parte da versão do modelo —
 * versão salva nunca muda, nem as frases dela.
 */
export interface PerguntaOpcao {
  id: string;
  /** A nota, entre escala_min e escala_max. É ela que vai como resposta. */
  valor: number;
  descricao: string;
  ordem: number;
}

/** Sem `ordem`: a posição na lista enviada é a ordem de exibição. */
export interface CreatePerguntaOpcaoInput {
  valor: number;
  descricao: string;
}

/** Sem `ordem`: a posição na lista enviada é que define a ordem (ver doc do endpoint). */
export interface CreatePerguntaInput {
  texto: string;
  tipo: string;
  escala_min: number;
  escala_max: number;
  obrigatoria: boolean;
  peso: number;
  /**
   * Descrição de cada nível (perguntas ESCALA) — obrigatória: exatamente
   * uma, não vazia, por nota de escala_min a escala_max. O back-end recusa
   * o salvamento sem elas.
   */
  opcoes: CreatePerguntaOpcaoInput[];
}
