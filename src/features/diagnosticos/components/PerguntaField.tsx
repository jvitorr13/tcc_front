import { AlertCircle } from "lucide-react";
import { useEffect, useState } from "react";

import { ErrorMessage } from "@/components/feedback/ErrorMessage";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { cn } from "@/utils/cn";

import { LIKERT_LABELS } from "@/features/diagnosticos/constants/likert";
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

const OPCAO_BASE =
  "rounded-lg border text-sm transition-colors disabled:opacity-100";

/**
 * Uma pergunta + o campo de resposta certo pro `tipo`:
 *  - ESCALA com `opcoes`: cada nível com a nota e a descrição, na ordem recebida;
 *    clicar envia o `valor` da opção;
 *  - ESCALA sem `opcoes`: botões de escala_min a escala_max;
 *  - SIM_NAO: botões Sim/Não -> "SIM" | "NAO";
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
        <Campo pergunta={pergunta} value={value} onAnswer={onAnswer} isSaving={isSaving} readOnly={readOnly} />
      </div>

      {error && <ErrorMessage>{error}</ErrorMessage>}
    </div>
  );
}

type CampoProps = Pick<PerguntaFieldProps, "pergunta" | "value" | "onAnswer" | "isSaving" | "readOnly">;

function Campo({ pergunta, value, onAnswer, isSaving, readOnly }: CampoProps) {
  const pick = readOnly ? undefined : onAnswer;

  switch (pergunta.tipo) {
    case "SIM_NAO":
      return (
        <div className="flex gap-2" role="radiogroup" aria-label={pergunta.texto}>
          {(
            [
              ["SIM", "Sim"],
              ["NAO", "Não"],
            ] as const
          ).map(([valor, label]) => (
            <button
              key={valor}
              type="button"
              role="radio"
              aria-checked={value === valor}
              onClick={pick ? () => pick(valor) : undefined}
              disabled={readOnly || isSaving}
              className={cn(
                OPCAO_BASE,
                "h-10 min-w-20 px-4 font-medium",
                readOnly ? "disabled:cursor-default" : "disabled:cursor-wait",
                value === valor ? "border-ink-900 bg-ink-900 text-white" : "border-ink-900/15 text-ink-700",
                !readOnly && value !== valor && "hover:bg-ink-900/5",
              )}
            >
              {label}
            </button>
          ))}
        </div>
      );

    case "TEXTO":
    case "MULTIPLA_ESCOLHA":
      return <CampoTexto pergunta={pergunta} value={value} onAnswer={pick} readOnly={readOnly} />;

    case "ESCALA":
    default:
      if (pergunta.opcoes?.length > 0) {
        return (
          <div className="grid gap-2" role="radiogroup" aria-label={pergunta.texto}>
            {pergunta.opcoes.map((opcao) => {
              const selected = value === String(opcao.valor);
              return (
                <button
                  key={opcao.id}
                  type="button"
                  role="radio"
                  aria-checked={selected}
                  onClick={pick ? () => pick(String(opcao.valor)) : undefined}
                  disabled={readOnly || isSaving}
                  className={cn(
                    OPCAO_BASE,
                    "flex items-start gap-3 px-3.5 py-2.5 text-left",
                    readOnly ? "disabled:cursor-default" : "disabled:cursor-wait",
                    selected ? "border-ink-900 bg-ink-900/[0.04] text-ink-900" : "border-ink-900/15 text-ink-700",
                    !readOnly && !selected && "hover:bg-ink-900/5",
                  )}
                >
                  <span
                    aria-hidden
                    className={cn(
                      "flex size-8 shrink-0 items-center justify-center rounded-md border text-sm font-semibold",
                      selected ? "border-ink-900 bg-ink-900 text-white" : "border-ink-900/15 text-ink-700",
                    )}
                  >
                    {opcao.valor}
                  </span>
                  <span className="self-center">{opcao.descricao}</span>
                </button>
              );
            })}
          </div>
        );
      }

      if (pergunta.escala_min == null || pergunta.escala_max == null) return null;
      return (
        <div className="flex flex-wrap gap-2" role="radiogroup" aria-label={pergunta.texto}>
          {Array.from(
            { length: pergunta.escala_max - pergunta.escala_min + 1 },
            (_, index) => pergunta.escala_min! + index,
          ).map((nota) => {
            const label = LIKERT_LABELS[nota];
            const selected = value === String(nota);
            return (
              <button
                key={nota}
                type="button"
                role="radio"
                aria-checked={selected}
                aria-label={label ? `${nota} - ${label}` : String(nota)}
                title={label}
                onClick={pick ? () => pick(String(nota)) : undefined}
                disabled={readOnly || isSaving}
                className={cn(
                  OPCAO_BASE,
                  "flex size-10 items-center justify-center font-medium",
                  readOnly ? "disabled:cursor-default" : "disabled:cursor-wait",
                  selected ? "border-ink-900 bg-ink-900 text-white" : "border-ink-900/15 text-ink-700",
                  !readOnly && !selected && "hover:bg-ink-900/5",
                )}
              >
                {nota}
              </button>
            );
          })}
        </div>
      );
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
