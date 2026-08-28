import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle, CheckCircle2, ClipboardCheck, Plus, Trash2 } from "lucide-react";
import { type Control, type FieldErrors, useFieldArray, useForm, type UseFormRegister } from "react-hook-form";

import { ErrorMessage } from "@/components/feedback/ErrorMessage";
import { Spinner } from "@/components/feedback/Spinner";
import { FormField } from "@/components/forms/FormField";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";

import {
  createModeloSchema,
  type CreateModeloFormData,
} from "@/features/questionario/schemas/create-modelo.schema";

export type ItemSaveStatus = "idle" | "saving" | "done" | "error";

export interface SaveStatusInfo {
  status: ItemSaveStatus;
  error?: string;
}

export interface CreateModeloFormProps {
  onSubmit: (data: CreateModeloFormData) => void | Promise<void>;
  onCancel: () => void;
  isSubmitting: boolean;
  /** Trava edição de todos os campos — ligado a partir da primeira tentativa de salvar. */
  isLocked: boolean;
  hasAttempted: boolean;
  submitError?: string | null;
  getAreaStatus: (areaIndex: number) => SaveStatusInfo | undefined;
  getPerguntaStatus: (areaIndex: number, perguntaIndex: number) => SaveStatusInfo | undefined;
}

const NOVA_PERGUNTA = { texto: "", escala_min: 1, escala_max: 5, obrigatoria: true, peso: 1 };
const NOVA_AREA = { nome: "", perguntas: [NOVA_PERGUNTA] };

/**
 * Monta modelo + áreas + perguntas num só formulário (useFieldArray
 * aninhado). O envio em si é sequencial no back-end (POST modelo, depois
 * POST de cada área, depois POST de cada pergunta — não existe endpoint
 * atômico) — quem orquestra isso e decide o que já foi salvo é a página
 * (CreateModeloPage); este componente só coleta os dados e mostra o
 * progresso por item via getAreaStatus/getPerguntaStatus.
 */
export function CreateModeloForm({
  onSubmit,
  onCancel,
  isSubmitting,
  isLocked,
  hasAttempted,
  submitError,
  getAreaStatus,
  getPerguntaStatus,
}: CreateModeloFormProps) {
  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateModeloFormData>({
    resolver: zodResolver(createModeloSchema),
    defaultValues: { nome: "", versao: "1", areas: [] },
  });

  const {
    fields: areaFields,
    append: appendArea,
    remove: removeArea,
  } = useFieldArray({ control, name: "areas" });

  const areasRootError = typeof errors.areas?.message === "string" ? errors.areas.message : undefined;

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-6">
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-[2fr_1fr]">
        <FormField
          label="Nome do modelo"
          placeholder="Ex: Diagnóstico de Maturidade Empresarial"
          error={errors.nome?.message}
          disabled={isLocked}
          {...register("nome")}
        />
        <FormField label="Versão" placeholder="1" error={errors.versao?.message} disabled={isLocked} {...register("versao")} />
      </div>

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
            disabled={isLocked}
            onRemoveArea={() => removeArea(areaIndex)}
            status={getAreaStatus(areaIndex)}
            getPerguntaStatus={(perguntaIndex) => getPerguntaStatus(areaIndex, perguntaIndex)}
          />
        ))}

        <Button type="button" variant="secondary" onClick={() => appendArea(NOVA_AREA)} disabled={isLocked}>
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
          {hasAttempted ? "Tentar novamente" : "Salvar modelo"}
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
  status?: SaveStatusInfo;
  getPerguntaStatus: (perguntaIndex: number) => SaveStatusInfo | undefined;
}

function AreaFieldset({
  control,
  register,
  errors,
  areaIndex,
  disabled,
  onRemoveArea,
  status,
  getPerguntaStatus,
}: AreaFieldsetProps) {
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
        <div className="flex-1">
          <FormField
            label={`Área ${areaIndex + 1}`}
            placeholder="Ex: Financeiro"
            error={areaErrors?.nome?.message}
            disabled={disabled}
            {...register(`areas.${areaIndex}.nome`)}
          />
        </div>
        <div className="flex items-center gap-2 pt-7">
          <SaveStatusIndicator status={status} />
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
            status={getPerguntaStatus(perguntaIndex)}
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
  status?: SaveStatusInfo;
}

function PerguntaFieldset({ register, errors, areaIndex, perguntaIndex, disabled, onRemove, status }: PerguntaFieldsetProps) {
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
          <SaveStatusIndicator status={status} />
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

function SaveStatusIndicator({ status }: { status?: SaveStatusInfo }) {
  if (!status || status.status === "idle") return null;
  if (status.status === "saving") return <Spinner size="sm" className="text-ink-500" />;
  if (status.status === "done") return <CheckCircle2 size={17} className="text-success-600" aria-label="Salvo" />;
  return <AlertCircle size={17} className="text-danger-600" aria-label={status.error ?? "Erro ao salvar"} />;
}
