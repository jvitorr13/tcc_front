import { zodResolver } from "@hookform/resolvers/zod";
import { ClipboardCheck, Plus, Trash2 } from "lucide-react";
import { useEffect } from "react";
import {
  type Control,
  type FieldErrors,
  useFieldArray,
  useForm,
  type UseFormRegister,
  useWatch,
} from "react-hook-form";

import { ErrorMessage } from "@/components/feedback/ErrorMessage";
import { FormField } from "@/components/forms/FormField";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";

import {
  createModeloSchema,
  type CreateModeloFormData,
  OPCAO_DESCRICAO_MAX,
} from "@/features/questionario/schemas/create-modelo.schema";
import { isErroDeOpcoes, parseErroPosicao } from "@/features/questionario/utils/parse-erro-posicao";

export interface CreateModeloFormProps {
  onSubmit: (data: CreateModeloFormData) => void | Promise<void>;
  onCancel: () => void;
  isSubmitting: boolean;
  /**
   * Erro geral do submit (vira banner). Se vier com a posição no começo
   * ("área N, pergunta M[, opção K]: ..."), também é marcado no campo da
   * pergunta/opção correspondente.
   */
  submitError?: string | null;
  /** 409 "já existe um modelo com este nome" — vai direto no campo, não banner. */
  conflictError?: string | null;
  /**
   * Árvore inicial — usada pela tela de nova versão, que parte de uma
   * versão existente (ver versaoToFormData). Sem isso, formulário vazio.
   */
  defaultValues?: CreateModeloFormData;
  /** Nova versão: o nome é do modelo, não muda — só exibido. */
  nomeReadOnly?: boolean;
  submitLabel?: string;
}

const NOVA_PERGUNTA = { texto: "", escala_min: 1, escala_max: 5, obrigatoria: true, peso: 1, opcoes: [] };
const NOVA_AREA = { nome: "", descricao: "", perguntas: [NOVA_PERGUNTA] };

/**
 * Monta modelo + áreas + perguntas (+ opções de cada escala) num só
 * formulário (useFieldArray aninhado) e envia a árvore inteira de uma vez.
 * Serve pros dois fluxos: criar modelo (POST /questionario/modelos) e
 * salvar nova versão (POST /questionario/modelos/:id/versoes) — o back-end
 * grava tudo numa transação única, então não há orquestração por item aqui.
 */
export function CreateModeloForm({
  onSubmit,
  onCancel,
  isSubmitting,
  submitError,
  conflictError,
  defaultValues,
  nomeReadOnly,
  submitLabel = "Salvar modelo",
}: CreateModeloFormProps) {
  const {
    register,
    control,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<CreateModeloFormData>({
    resolver: zodResolver(createModeloSchema),
    defaultValues: defaultValues ?? { nome: "", areas: [] },
  });

  useEffect(() => {
    if (conflictError) setError("nome", { type: "manual", message: conflictError });
  }, [conflictError, setError]);

  // 400 com posição: além do banner geral, marca o erro no campo exato.
  useEffect(() => {
    if (!submitError) return;
    const erro = parseErroPosicao(submitError);
    if (!erro) return;
    const pergunta = `areas.${erro.areaIndex}.perguntas.${erro.perguntaIndex}` as const;
    if (erro.opcaoIndex != null) {
      setError(
        `${pergunta}.opcoes.${erro.opcaoIndex}.descricao`,
        { type: "server", message: erro.detalhe },
        { shouldFocus: true },
      );
    } else if (isErroDeOpcoes(erro.detalhe)) {
      setError(`${pergunta}.opcoes`, { type: "server", message: erro.detalhe });
    } else {
      setError(`${pergunta}.texto`, { type: "server", message: erro.detalhe }, { shouldFocus: true });
    }
  }, [submitError, setError]);

  const {
    fields: areaFields,
    append: appendArea,
    remove: removeArea,
  } = useFieldArray({ control, name: "areas" });

  const areasRootError = typeof errors.areas?.message === "string" ? errors.areas.message : undefined;

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-6">
      <FormField
        label="Nome do modelo"
        placeholder="Ex: Diagnóstico de Maturidade Empresarial"
        error={errors.nome?.message}
        disabled={isSubmitting}
        readOnly={nomeReadOnly}
        className={nomeReadOnly ? "bg-canvas text-ink-600" : undefined}
        {...register("nome")}
      />

      <div className="space-y-4">
        <h2 className="font-display text-lg text-ink-900">Áreas</h2>

        {areasRootError && <ErrorMessage>{areasRootError}</ErrorMessage>}

        {areaFields.length === 0 && (
          <p className="rounded-lg border border-dashed border-ink-900/15 px-4 py-6 text-center text-sm text-ink-500">
            Nenhuma área adicionada ainda.
          </p>
        )}

        {areaFields.map((areaField, areaIndex) => (
          <AreaFieldset
            key={areaField.id}
            control={control}
            register={register}
            errors={errors}
            areaIndex={areaIndex}
            disabled={isSubmitting}
            onRemoveArea={() => removeArea(areaIndex)}
          />
        ))}

        <Button type="button" variant="secondary" onClick={() => appendArea(NOVA_AREA)} disabled={isSubmitting}>
          <Plus size={16} />
          Adicionar área
        </Button>
      </div>

      {submitError && (
        <div className="rounded-lg border border-danger-500/20 bg-danger-50 px-3.5 py-2.5">
          <ErrorMessage className="mt-0">{submitError}</ErrorMessage>
        </div>
      )}

      <div className="flex gap-3 pt-1">
        <Button type="button" variant="secondary" size="lg" className="flex-1" onClick={onCancel} disabled={isSubmitting}>
          Cancelar
        </Button>
        <Button type="submit" size="lg" className="flex-1" isLoading={isSubmitting}>
          {!isSubmitting && <ClipboardCheck size={17} />}
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}

interface AreaFieldsetProps {
  control: Control<CreateModeloFormData>;
  register: UseFormRegister<CreateModeloFormData>;
  errors: FieldErrors<CreateModeloFormData>;
  areaIndex: number;
  disabled: boolean;
  onRemoveArea: () => void;
}

function AreaFieldset({ control, register, errors, areaIndex, disabled, onRemoveArea }: AreaFieldsetProps) {
  const {
    fields: perguntaFields,
    append: appendPergunta,
    remove: removePergunta,
  } = useFieldArray({ control, name: `areas.${areaIndex}.perguntas` });

  const areaErrors = errors.areas?.[areaIndex];
  const perguntasRootError = typeof areaErrors?.perguntas?.message === "string" ? areaErrors.perguntas.message : undefined;

  return (
    <div className="rounded-xl border border-ink-900/10 p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 space-y-3">
          <FormField
            label={`Área ${areaIndex + 1}`}
            placeholder="Ex: Financeiro"
            error={areaErrors?.nome?.message}
            disabled={disabled}
            {...register(`areas.${areaIndex}.nome`)}
          />
          <FormField
            label="Descrição"
            placeholder="Opcional"
            error={areaErrors?.descricao?.message}
            disabled={disabled}
            {...register(`areas.${areaIndex}.descricao`)}
          />
        </div>
        <div className="flex items-center gap-2 pt-7">
          <Button type="button" variant="ghost" size="sm" onClick={onRemoveArea} disabled={disabled} aria-label="Remover área">
            <Trash2 size={15} />
          </Button>
        </div>
      </div>

      {perguntasRootError && <ErrorMessage>{perguntasRootError}</ErrorMessage>}

      <div className="mt-4 space-y-3">
        {perguntaFields.map((perguntaField, perguntaIndex) => (
          <PerguntaFieldset
            key={perguntaField.id}
            control={control}
            register={register}
            errors={errors}
            areaIndex={areaIndex}
            perguntaIndex={perguntaIndex}
            disabled={disabled}
            onRemove={() => removePergunta(perguntaIndex)}
          />
        ))}
      </div>

      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="mt-3"
        onClick={() => appendPergunta(NOVA_PERGUNTA)}
        disabled={disabled}
      >
        <Plus size={14} />
        Adicionar pergunta
      </Button>
    </div>
  );
}

interface PerguntaFieldsetProps {
  control: Control<CreateModeloFormData>;
  register: UseFormRegister<CreateModeloFormData>;
  errors: FieldErrors<CreateModeloFormData>;
  areaIndex: number;
  perguntaIndex: number;
  disabled: boolean;
  onRemove: () => void;
}

function PerguntaFieldset({ control, register, errors, areaIndex, perguntaIndex, disabled, onRemove }: PerguntaFieldsetProps) {
  const perguntaErrors = errors.areas?.[areaIndex]?.perguntas?.[perguntaIndex];
  const textoId = `areas.${areaIndex}.perguntas.${perguntaIndex}.texto`;
  const areaNome = useWatch({ control, name: `areas.${areaIndex}.nome` });

  return (
    <div className="rounded-lg border border-ink-900/8 bg-ink-900/[0.02] p-3.5">
      <p className="text-xs font-medium uppercase tracking-wide text-ink-500">
        {`Pergunta ${perguntaIndex + 1}`}
        {areaNome?.trim() && <span className="normal-case tracking-normal text-ink-500"> · Área: {areaNome}</span>}
      </p>
      <div className="mt-1.5 flex items-start gap-2">
        <div className="flex-1">
          <Label htmlFor={textoId}>Texto da pergunta</Label>
          <Input
            id={textoId}
            placeholder="Ex: Como a empresa controla o fluxo de caixa?"
            hasError={Boolean(perguntaErrors?.texto)}
            disabled={disabled}
            {...register(`areas.${areaIndex}.perguntas.${perguntaIndex}.texto`)}
          />
          <ErrorMessage>{perguntaErrors?.texto?.message}</ErrorMessage>
        </div>
        <div className="flex items-center gap-1.5 pt-7">
          <Button type="button" variant="ghost" size="sm" onClick={onRemove} disabled={disabled} aria-label="Remover pergunta">
            <Trash2 size={14} />
          </Button>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-start gap-4">
        <div className="w-28">
          {/* Único tipo criado pelo editor hoje — fixado no payload (ver formToAreasInput). */}
          <Label>Tipo</Label>
          <p className="flex h-11 items-center rounded-lg border border-ink-900/10 bg-canvas px-3.5 text-sm text-ink-600">
            Escala
          </p>
        </div>
        <div className="w-24">
          <Label htmlFor={`${textoId}-escala-min`}>Mínimo</Label>
          <Input
            id={`${textoId}-escala-min`}
            type="number"
            hasError={Boolean(perguntaErrors?.escala_min)}
            disabled={disabled}
            {...register(`areas.${areaIndex}.perguntas.${perguntaIndex}.escala_min`, { valueAsNumber: true })}
          />
        </div>
        <div className="w-24">
          <Label htmlFor={`${textoId}-escala-max`}>Máximo</Label>
          <Input
            id={`${textoId}-escala-max`}
            type="number"
            hasError={Boolean(perguntaErrors?.escala_max)}
            disabled={disabled}
            {...register(`areas.${areaIndex}.perguntas.${perguntaIndex}.escala_max`, { valueAsNumber: true })}
          />
          <ErrorMessage>{perguntaErrors?.escala_max?.message}</ErrorMessage>
        </div>
        <div className="w-24">
          <Label htmlFor={`${textoId}-peso`}>Peso</Label>
          <Input
            id={`${textoId}-peso`}
            type="number"
            step="0.5"
            hasError={Boolean(perguntaErrors?.peso)}
            disabled={disabled}
            {...register(`areas.${areaIndex}.perguntas.${perguntaIndex}.peso`, { valueAsNumber: true })}
          />
        </div>
        <label className="flex items-center gap-2 pt-7 pb-2.5 text-sm text-ink-700">
          <input
            type="checkbox"
            className="size-4 rounded border-ink-900/25 accent-ink-900"
            disabled={disabled}
            {...register(`areas.${areaIndex}.perguntas.${perguntaIndex}.obrigatoria`)}
          />
          Obrigatória
        </label>
      </div>

      <OpcoesFieldset
        control={control}
        register={register}
        errors={errors}
        areaIndex={areaIndex}
        perguntaIndex={perguntaIndex}
        disabled={disabled}
      />
    </div>
  );
}

type OpcoesFieldsetProps = Omit<PerguntaFieldsetProps, "onRemove">;

/** Notas de escala_min a escala_max — vazio enquanto a escala digitada for inválida. */
function rangeNotas(min: number, max: number): number[] {
  if (!Number.isInteger(min) || !Number.isInteger(max) || max < min || max - min > 20) return [];
  return Array.from({ length: max - min + 1 }, (_, index) => min + index);
}

/**
 * "Descrever cada nível": opcional. Ligado, gera uma linha fixa por nota
 * (de Mínimo a Máximo, em ordem crescente) pra escrever o texto que o
 * cliente vê naquele nível; desligado, a pergunta fica só com números
 * (opcoes = []). As linhas acompanham a escala: mudar Mínimo/Máximo
 * recria a lista mantendo o texto das notas que continuam existindo — por
 * isso nunca falta nem sobra nível, e a nota de cada linha não é editável.
 */
function OpcoesFieldset({ control, register, errors, areaIndex, perguntaIndex, disabled }: OpcoesFieldsetProps) {
  const pergunta = `areas.${areaIndex}.perguntas.${perguntaIndex}` as const;
  const { fields, replace } = useFieldArray({ control, name: `${pergunta}.opcoes` });
  const [escalaMin, escalaMax, opcoes] = useWatch({
    control,
    name: [`${pergunta}.escala_min`, `${pergunta}.escala_max`, `${pergunta}.opcoes`],
  });

  const notas = rangeNotas(escalaMin, escalaMax);
  const descreverNiveis = fields.length > 0;

  // Mantém uma linha por nota quando a escala muda (ou quando uma versão
  // antiga chega com as opções fora de ordem). Só regrava se a sequência de
  // notas for diferente — senão entraria em loop com o próprio replace.
  const sequenciaAtual = (opcoes ?? []).map((opcao) => opcao.valor).join(",");
  const sequenciaEsperada = notas.join(",");
  useEffect(() => {
    if (!descreverNiveis || notas.length === 0 || sequenciaAtual === sequenciaEsperada) return;
    const textoPorNota = new Map((opcoes ?? []).map((opcao) => [opcao.valor, opcao.descricao]));
    replace(notas.map((nota) => ({ valor: nota, descricao: textoPorNota.get(nota) ?? "" })));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [descreverNiveis, sequenciaAtual, sequenciaEsperada]);

  function toggle(checked: boolean) {
    replace(checked ? notas.map((nota) => ({ valor: nota, descricao: "" })) : []);
  }

  const opcoesErrors = errors.areas?.[areaIndex]?.perguntas?.[perguntaIndex]?.opcoes;
  const rootError = opcoesErrors?.message ?? opcoesErrors?.root?.message;
  const toggleId = `${pergunta}.descrever-niveis`;

  return (
    <div className="mt-3 border-t border-ink-900/8 pt-3">
      <label htmlFor={toggleId} className="flex w-fit items-center gap-2 text-sm font-medium text-ink-800">
        <input
          id={toggleId}
          type="checkbox"
          className="size-4 rounded border-ink-900/25 accent-ink-900"
          checked={descreverNiveis}
          onChange={(event) => toggle(event.target.checked)}
          disabled={disabled || (!descreverNiveis && notas.length === 0)}
        />
        Descrever cada nível
      </label>

      {!descreverNiveis && (
        <p className="mt-1 text-xs text-ink-500">
          {notas.length > 0
            ? `Sem descrição, o cliente vê só os números de ${escalaMin} a ${escalaMax}.`
            : "Defina uma escala válida para poder descrever os níveis."}
        </p>
      )}

      {descreverNiveis && (
        <>
          <ol className="mt-3 space-y-2">
            {fields.map((field, index) => {
              const opcaoErrors = opcoesErrors?.[index];
              const texto = opcoes?.[index]?.descricao ?? "";
              const id = `${pergunta}.opcoes.${index}.descricao`;
              return (
                <li key={field.id} className="flex items-start gap-3">
                  <span
                    aria-hidden
                    className="flex size-11 shrink-0 items-center justify-center rounded-lg border border-ink-900/15 bg-white text-sm font-semibold text-ink-900"
                  >
                    {opcoes?.[index]?.valor}
                  </span>
                  <div className="min-w-0 flex-1">
                    <Input
                      id={id}
                      aria-label={`Descrição do nível ${opcoes?.[index]?.valor}`}
                      placeholder="Ex: Controla em planilha, atualizada toda semana."
                      maxLength={OPCAO_DESCRICAO_MAX}
                      hasError={Boolean(opcaoErrors?.descricao)}
                      disabled={disabled}
                      {...register(`${pergunta}.opcoes.${index}.descricao`)}
                    />
                    <div className="mt-1 flex items-start justify-between gap-3">
                      <ErrorMessage className="mt-0">{opcaoErrors?.descricao?.message}</ErrorMessage>
                      <span className="ml-auto shrink-0 text-xs tabular-nums text-ink-500">
                        {texto.length}/{OPCAO_DESCRICAO_MAX}
                      </span>
                    </div>
                  </div>
                </li>
              );
            })}
          </ol>

          <p className="mt-2 text-xs text-ink-500">
            Texto de até {OPCAO_DESCRICAO_MAX} caracteres. Todos os níveis precisam estar preenchidos.
          </p>
        </>
      )}

      {rootError && <ErrorMessage>{rootError}</ErrorMessage>}
    </div>
  );
}
