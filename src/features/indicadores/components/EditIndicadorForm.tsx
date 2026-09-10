import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { ErrorMessage } from "@/components/feedback/ErrorMessage";
import { FormField } from "@/components/forms/FormField";
import { SelectField } from "@/components/forms/SelectField";
import { TextareaField } from "@/components/forms/TextareaField";
import { Button } from "@/components/ui/Button";

import {
  updateIndicadorSchema,
  type UpdateIndicadorFormData,
} from "@/features/indicadores/schemas/update-indicador.schema";

export interface EditIndicadorFormProps {
  defaultValues: UpdateIndicadorFormData;
  onSubmit: (data: UpdateIndicadorFormData) => void | Promise<void>;
  onCancel: () => void;
  isSubmitting: boolean;
  submitError?: string | null;
}

/** Empresa não é editável aqui — o vínculo do indicador com a empresa é fixo desde a criação. */
export function EditIndicadorForm({ defaultValues, onSubmit, onCancel, isSubmitting, submitError }: EditIndicadorFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<UpdateIndicadorFormData>({
    resolver: zodResolver(updateIndicadorSchema),
    defaultValues,
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
      <FormField label="Nome" error={errors.nome?.message} {...register("nome")} />
      <TextareaField label="Descrição" error={errors.descricao?.message} {...register("descricao")} />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <FormField label="Unidade" error={errors.unidade?.message} {...register("unidade")} />
        <FormField label="Meta" type="number" step="any" error={errors.meta?.message} {...register("meta")} />
      </div>

      <SelectField label="Periodicidade" error={errors.periodicidade?.message} {...register("periodicidade")}>
        <option value="MENSAL">Mensal</option>
        <option value="TRIMESTRAL">Trimestral</option>
        <option value="SEMESTRAL">Semestral</option>
        <option value="ANUAL">Anual</option>
      </SelectField>

      {submitError && <ErrorMessage>{submitError}</ErrorMessage>}

      <div className="flex gap-3">
        <Button type="button" variant="secondary" size="sm" onClick={onCancel} disabled={isSubmitting}>
          Cancelar
        </Button>
        <Button type="submit" size="sm" isLoading={isSubmitting}>
          Salvar
        </Button>
      </div>
    </form>
  );
}
