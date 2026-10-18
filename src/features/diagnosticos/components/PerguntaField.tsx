import { AlertCircle } from "lucide-react";
import { type ReactNode, useEffect, useState } from "react";

import { ErrorMessage } from "@/components/feedback/ErrorMessage";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { cn } from "@/utils/cn";

import type { Pergunta } from "@/features/diagnosticos/types/diagnostico.types";

export interface PerguntaFieldProps {
  pergunta: Pergunta;
  /** Resposta atual, sempre string (como a API grava). undefined = sem resposta. */
  value?: string;
  /** Sempre string — ver RegistrarRespostaInput. Quem salva (POST /respostas) é a página. */
  onAnswer?: (valor: string) => void;
  isSaving?: boolean;
  /** Destaque "precisa ser respondida" (obrigatória pendente, depois de tentar finalizar). */
  isMissing?: boolean;
  /** Erro 400 do POST /respostas desta pergunta — mostrado junto ao campo. */
  error?: string;
  /**
   * Modo consulta (CONSULTOR vendo o diagnóstico de uma empresa): mostra a
   * resposta marcada, mas sem onClick/onChange — não é só um disabled
   * visual. Só quem responde (EMPRESA) usa readOnly=false.
   */
  readOnly?: boolean;
}


/**
 * Uma pergunta + o campo de resposta certo pro `tipo`:
 *  - ESCALA: um cartão por nível, de escala_min a escala_max em ordem
 *    crescente, com o número e a descrição cadastrada; escolher envia o
 *    número do nível. (Dado antigo sem descrição: mostra só o número.)
 *  - SIM_NAO: Sim/Não -> "SIM" | "NAO";
 *  - MULTIPLA_ESCOLHA: campo de texto; TEXTO: textarea (texto livre).
 * Escolhas (escala/sim-não) salvam no clique; texto salva ao sair do campo
 * (blur), pra não mandar um POST por tecla. Único componente pras duas
 * telas (responder e consultar) — a diferença é só `readOnly`.
 */
export function PerguntaField({ pergunta, value, onAnswer, isSaving, isMissing, error, readOnly }: PerguntaFieldProps) {
  return (
    <div
      className={cn(
        "py-4",
        (isMissing || error) && "-mx-4 rounded-lg border border-danger-500/30 bg-danger-50/60 px-4",
      )}
    >
      {isMissing && !error && (
        <p className="mb-2 flex items-center gap-1.5 text-xs font-medium text-danger-600">
          <AlertCircle size={13} className="shrink-0" />
          Esta pergunta precisa ser respondida.
        </p>
      )}

      <p className="text-sm font-medium text-ink-900">
        {pergunta.texto}
        {pergunta.obrigatoria && (
          <span className="ml-1 text-danger-600" aria-label="obrigatória">
            *
          </span>
        )}
      </p>

      <div className="mt-3">
        <CampoResposta pergunta={pergunta} value={value} onAnswer={onAnswer} isSaving={isSaving} readOnly={readOnly} />
      </div>

      {error && <ErrorMessage>{error}</ErrorMessage>}
    </div>
  );
}

type CampoProps = Pick<PerguntaFieldProps, "pergunta" | "value" | "onAnswer" | "isSaving" | "readOnly"> & {
  /** Linhas maiores pros níveis da escala — usado na tela de uma pergunta por vez (PerguntaPasso). */
  large?: boolean;
};

interface OpcaoRadioProps {
  name: string;
  id: string;
  valor: string;
  checked: boolean;
  onPick?: (valor: string) => void;
  readOnly?: boolean;
  className?: string;
  children: ReactNode;
}

/**
 * Uma opção = `input type="radio"` de verdade + `label` (o cartão inteiro
 * é clicável). Teclado: Tab entra no grupo, setas trocam a opção — o
 * comportamento nativo do radio. O input fica visualmente oculto; o foco
 * aparece como anel no cartão.
 */
function OpcaoRadio({ name, id, valor, checked, onPick, readOnly, className, children }: OpcaoRadioProps) {
  return (
    <label
      htmlFor={id}
      className={cn(
        "relative flex rounded-lg border text-sm transition-colors",
        "has-[input:focus-visible]:ring-2 has-[input:focus-visible]:ring-gold-500/60 has-[input:focus-visible]:ring-offset-1",
        readOnly ? "cursor-default" : "cursor-pointer",
        checked
          ? "border-ink-900 bg-ink-900/[0.04] text-ink-900 ring-1 ring-ink-900"
          : "border-ink-900/12 bg-surface text-ink-700",
        !readOnly && !checked && "hover:border-ink-900/25 hover:bg-ink-900/[0.02]",
        className,
      )}
    >
      <input
        type="radio"
        id={id}
        name={name}
        value={valor}
        checked={checked}
        onChange={() => onPick?.(valor)}
        disabled={readOnly}
        className="sr-only"
      />
      {children}
    </label>
  );
}

/**
 * Só o controle de resposta (sem o enunciado), pra quem monta o próprio
 * cabeçalho da pergunta — ver PerguntaPasso. Mesmas regras de PerguntaField.
 */
export function CampoResposta({ pergunta, value, onAnswer, readOnly, large }: CampoProps) {
  const pick = readOnly ? undefined : onAnswer;
  const name = `pergunta-${pergunta.id}`;

  switch (pergunta.tipo) {
    case "SIM_NAO":
      return (
        <fieldset>
          <legend className="sr-only">{pergunta.texto}</legend>
          <div className="flex flex-wrap gap-2">
            {(
              [
                ["SIM", "Sim"],
                ["NAO", "Não"],
              ] as const
            ).map(([valor, label]) => (
              <OpcaoRadio
                key={valor}
                name={name}
                id={`${name}-${valor}`}
                valor={valor}
                checked={value === valor}
                onPick={pick}
                readOnly={readOnly}
                className={cn("items-center justify-center font-medium", large ? "h-12 min-w-28 px-5" : "h-10 min-w-20 px-4")}
              >
                {label}
              </OpcaoRadio>
            ))}
          </div>
        </fieldset>
      );

    case "TEXTO":
    case "MULTIPLA_ESCOLHA":
      return <CampoTexto pergunta={pergunta} value={value} onAnswer={pick} readOnly={readOnly} />;

    case "ESCALA":
    default: {
      // Níveis de escala_min a escala_max (sem fixar 5), em ordem crescente;
      // a descrição de cada um vem de `opcoes`, casada pelo valor. Sem
      // escala informada, usa os próprios valores das opções.
      const descricaoPorNivel = new Map((pergunta.opcoes ?? []).map((opcao) => [opcao.valor, opcao.descricao]));
      const niveis =
        pergunta.escala_min != null && pergunta.escala_max != null && pergunta.escala_max >= pergunta.escala_min
          ? Array.from(
              { length: pergunta.escala_max - pergunta.escala_min + 1 },
              (_, index) => pergunta.escala_min! + index,
            )
          : [...descricaoPorNivel.keys()].sort((a, b) => a - b);

      return (
        <fieldset>
          <legend className="sr-only">{pergunta.texto}</legend>
          <div className={cn("grid", large ? "gap-2.5" : "gap-2")}>
            {niveis.map((nivel) => {
              const valor = String(nivel);
              const checked = value === valor;
              const descricao = descricaoPorNivel.get(nivel)?.trim();
              return (
                <OpcaoRadio
                  key={nivel}
                  name={name}
                  id={`${name}-${nivel}`}
                  valor={valor}
                  checked={checked}
                  onPick={pick}
                  readOnly={readOnly}
                  className={cn(
                    "items-center text-left",
                    large ? "gap-4 rounded-xl px-4 py-4 text-[15px]" : "gap-3 px-3.5 py-2.5",
                  )}
                >
                  <span
                    aria-hidden={Boolean(descricao)}
                    className={cn(
                      "flex shrink-0 items-center justify-center rounded-md border text-sm font-semibold",
                      large ? "size-10" : "size-8",
                      checked ? "border-ink-900 bg-ink-900 text-white" : "border-ink-900/15 bg-surface text-ink-900",
                    )}
                  >
                    {nivel}
                  </span>
                  {descricao ? (
                    <span>
                      <span className="sr-only">Nível {nivel}: </span>
                      {descricao}
                    </span>
                  ) : (
                    <span className="sr-only">Nível {nivel}</span>
                  )}
                </OpcaoRadio>
              );
            })}
          </div>
        </fieldset>
      );
    }
  }
}

/**
 * Texto livre com rascunho local: digitar não salva; sair do campo envia
 * se o texto mudou. A página decide o que fazer com "" (só pode limpar
 * pergunta NÃO obrigatória — ver DiagnosticoDetalhePage.handleAnswer).
 */
function CampoTexto({ pergunta, value, onAnswer, readOnly }: Omit<CampoProps, "isSaving">) {
  const [draft, setDraft] = useState(value ?? "");

  // Acompanha a resposta salva quando ela chega/muda por fora (ex: semeada
  // de GET /respostas depois do mount).
  useEffect(() => {
    setDraft(value ?? "");
  }, [value]);

  function handleBlur() {
    const texto = draft.trim();
    if (texto !== (value ?? "")) onAnswer?.(texto);
  }

  const common = {
    value: draft,
    onChange: readOnly
      ? undefined
      : (event: { target: { value: string } }) => setDraft(event.target.value),
    onBlur: readOnly ? undefined : handleBlur,
    readOnly,
    "aria-label": pergunta.texto,
    placeholder: readOnly ? "Sem resposta" : "Digite sua resposta",
  };

  return pergunta.tipo === "TEXTO" ? <Textarea rows={3} {...common} /> : <Input {...common} />;
}
