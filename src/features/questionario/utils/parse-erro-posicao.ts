/**
 * Os 400 de validação do modelo (POST /questionario/modelos e .../versoes)
 * trazem a posição no começo da mensagem, sempre 1-based:
 *
 *   "área 2, pergunta 3: opcoes deve ter uma opção para cada nota da escala, ..."
 *   "área 2, pergunta 3, opção 4: descricao é obrigatória"
 *
 * Isto separa a posição (já convertida pra índice 0-based, igual aos
 * field arrays do formulário) do texto, pra marcar o erro no campo certo.
 * Mensagem sem esse prefixo -> null (vira só o banner geral).
 */
export interface ErroPosicao {
  areaIndex: number;
  perguntaIndex: number;
  /** Só quando a mensagem aponta uma opção específica. */
  opcaoIndex?: number;
  detalhe: string;
}

const PREFIXO = /^área\s+(\d+),\s*pergunta\s+(\d+)(?:,\s*opção\s+(\d+))?:\s*(.+)$/i;

export function parseErroPosicao(message: string): ErroPosicao | null {
  const match = PREFIXO.exec(message.trim());
  if (!match) return null;
  const [, area, pergunta, opcao, detalhe] = match;
  return {
    areaIndex: Number(area) - 1,
    perguntaIndex: Number(pergunta) - 1,
    opcaoIndex: opcao ? Number(opcao) - 1 : undefined,
    detalhe,
  };
}

/** A mensagem fala das opções/frases da pergunta (e não do texto/escala dela)? */
export function isErroDeOpcoes(detalhe: string): boolean {
  return /opç(ão|ões)|opcoes|cada nota/i.test(detalhe);
}
