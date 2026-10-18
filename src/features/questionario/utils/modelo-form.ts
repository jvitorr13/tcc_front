import type { CreateModeloFormData } from "@/features/questionario/schemas/create-modelo.schema";
import type { CreateAreaInput } from "@/features/questionario/types/area.types";
import type { ModeloVersao } from "@/features/questionario/types/modelo.types";

const porOrdem = <T extends { ordem: number }>(items: T[]) => [...items].sort((a, b) => a.ordem - b.ordem);

/**
 * Formulário -> árvore do payload (mesmo formato em POST /questionario/modelos
 * e POST /questionario/modelos/:id/versoes). A ordem de áreas, perguntas e
 * opções é a posição na lista — o front não envia `ordem`. `opcoes` vai
 * sempre (inclusive []): se não for reenviada, a versão nova fica sem frases.
 */
export function formToAreasInput(areas: CreateModeloFormData["areas"]): CreateAreaInput[] {
  return areas.map((area) => ({
    nome: area.nome,
    descricao: area.descricao,
    perguntas: area.perguntas.map((pergunta) => ({
      texto: pergunta.texto,
      tipo: "ESCALA",
      escala_min: pergunta.escala_min,
      escala_max: pergunta.escala_max,
      obrigatoria: pergunta.obrigatoria,
      peso: pergunta.peso,
      // Uma descrição por nível (obrigatórias), já "trimadas" pelo schema.
      opcoes: pergunta.opcoes.map((opcao) => ({ valor: opcao.valor, descricao: opcao.descricao })),
    })),
  }));
}

/**
 * Versão lida de GET /questionario/versoes/:id -> valores iniciais do
 * formulário de nova versão. Ordena por `ordem` por garantia (a API já
 * devolve na ordem de exibição) e carrega as opções de cada pergunta.
 */
export function versaoToFormData(nomeModelo: string, versao: ModeloVersao): CreateModeloFormData {
  return {
    nome: nomeModelo,
    areas: porOrdem(versao.areas ?? []).map((area) => ({
      nome: area.nome,
      descricao: area.descricao ?? "",
      perguntas: porOrdem(area.perguntas ?? []).map((pergunta) => ({
        texto: pergunta.texto,
        escala_min: pergunta.escala_min,
        escala_max: pergunta.escala_max,
        obrigatoria: pergunta.obrigatoria,
        peso: pergunta.peso,
        opcoes: porOrdem(pergunta.opcoes ?? []).map((opcao) => ({ valor: opcao.valor, descricao: opcao.descricao })),
      })),
    })),
  };
}
