import { zodResolver } from "@hookform/resolvers/zod";
import { ClipboardCheck, Plus, Trash2 } from "lucide-react";
import { useEffect } from "react";
import { type Control, type FieldErrors, useFieldArray, useForm, type UseFormRegister } from "react-hook-form";

import { ErrorMessage } from "@/components/feedback/ErrorMessage";
import { FormField } from "@/components/forms/FormField";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";

import {
  createModeloSchema,
  type CreateModeloFormData,
} from "@/features/questionario/schemas/create-modelo.schema";

export interface CreateModeloFormProps {
  onSubmit: (data: CreateModeloFormData) => void | Promise<void>;
  onCancel: () => void;
  isSubmitting: boolean;
  submitError?: string | null;
  /** 409 "já existe um modelo com este nome" — vai direto no campo, não banner. */
  conflictError?: string | null;
}

const NOVA_PERGUNTA = { texto: "", escala_min: 1, escala_max: 5, obrigatoria: true, peso: 1 };
const NOVA_AREA = { nome: "", descricao: "", perguntas: [NOVA_PERGUNTA] };

/**
 * Monta modelo + áreas + perguntas num só formulário (useFieldArray
 * aninhado) e envia tudo de uma vez: POST /questionario/modelos cria
 * modelo, versão 1 e as áreas/perguntas numa transação única no back-end,
 * então não há orquestração nem progresso por item aqui — só um submit,
 * como qualquer outro formulário do sistema.
 */
export function CreateModeloForm({ onSubmit, onCancel, isSubmitting, submitError, conflictError }: CreateModeloFormProps) {
  const {
    register,
    control,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<CreateModeloFormData>({
    resolver: zodResolver(createModeloSchema),
    defaultValues: { nome: "", areas: [] },
  });

  useEffect(() => {
    if (conflictError) setError("nome", { type: "manual", message: conflictError });
  }, [conflictError, setError]);

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
          Salvar modelo
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
  register: UseFormRegister<CreateModeloFormData>;
  errors: FieldErrors<CreateModeloFormData>;
  areaIndex: number;
  perguntaIndex: number;
  disabled: boolean;
  onRemove: () => void;
}

function PerguntaFieldset({ register, errors, areaIndex, perguntaIndex, disabled, onRemove }: PerguntaFieldsetProps) {
  const perguntaErrors = errors.areas?.[areaIndex]?.perguntas?.[perguntaIndex];
  const textoId = `areas.${areaIndex}.perguntas.${perguntaIndex}.texto`;

  return (
    <div className="rounded-lg border border-ink-900/8 bg-ink-900/[0.02] p-3.5">
      <div className="flex items-start gap-2">
        <div className="flex-1">
          <Label htmlFor={textoId}>{`Pergunta ${perguntaIndex + 1}`}</Label>
          <Input
            id={textoId}
            placeholder="Ex: A empresa possui controle financeiro?"
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
        <div className="w-24">
          <Label htmlFor={`${textoId}-escala-min`}>Escala mín.</Label>
          <Input
            id={`${textoId}-escala-min`}
            type="number"
            hasError={Boolean(perguntaErrors?.escala_min)}
            disabled={disabled}
            {...register(`areas.${areaIndex}.perguntas.${perguntaIndex}.escala_min`, { valueAsNumber: true })}
          />
        </div>
        <div className="w-24">
          <Label htmlFor={`${textoId}-escala-max`}>Escala máx.</Label>
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
    </div>
  );
}
