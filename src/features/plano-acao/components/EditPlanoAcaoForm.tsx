import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { ErrorMessage } from "@/components/feedback/ErrorMessage";
import { FormField } from "@/components/forms/FormField";
import { TextareaField } from "@/components/forms/TextareaField";
import { Button } from "@/components/ui/Button";

import {
  updatePlanoAcaoSchema,
  type UpdatePlanoAcaoFormData,
} from "@/features/plano-acao/schemas/update-plano-acao.schema";

export interface EditPlanoAcaoFormProps {
  defaultValues: UpdatePlanoAcaoFormData;
  onSubmit: (data: UpdatePlanoAcaoFormData) => void | Promise<void>;
  onCancel: () => void;
  isSubmitting: boolean;
  submitError?: string | null;
}

/** Só título/descrição — status não é editável aqui (vem sempre do back-end). */
export function EditPlanoAcaoForm({ defaultValues, onSubmit, onCancel, isSubmitting, submitError }: EditPlanoAcaoFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<UpdatePlanoAcaoFormData>({
    resolver: zodResolver(updatePlanoAcaoSchema),
    defaultValues,
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
      <FormField label="Título do plano" error={errors.titulo?.message} {...register("titulo")} />
      <TextareaField label="Descrição" error={errors.descricao?.message} {...register("descricao")} />

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
