import type { Pergunta } from "@/features/diagnosticos/types/diagnostico.types";

/**
 * Texto legível de uma resposta gravada (a API guarda tudo como string),
 * pra tela de revisão. ESCALA com descrição por nível mostra a frase do
 * nível escolhido; sem descrição, só o número.
 */
export function formatarResposta(pergunta: Pergunta, valor: string): string {
  switch (pergunta.tipo) {
    case "SIM_NAO":
      return valor === "SIM" ? "Sim" : valor === "NAO" ? "Não" : valor;
    case "TEXTO":
    case "MULTIPLA_ESCOLHA":
      return valor;
    case "ESCALA":
    default: {
      const opcao = (pergunta.opcoes ?? []).find((item) => String(item.valor) === valor);
      return opcao ? `Nível ${opcao.valor} — ${opcao.descricao}` : `Nível ${valor}`;
    }
  }
}
