import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { ErrorMessage } from "@/components/feedback/ErrorMessage";
import { FormField } from "@/components/forms/FormField";
import { TextareaField } from "@/components/forms/TextareaField";
import { Button } from "@/components/ui/Button";

import { createValorSchema, type CreateValorFormData } from "@/features/indicadores/schemas/create-valor.schema";

export interface RegistrarMedicaoFormProps {
  unidade: string;
  onSubmit: (data: CreateValorFormData) => void | Promise<void>;
  onCancel: () => void;
  isSubmitting: boolean;
  submitError?: string | null;
}

export function RegistrarMedicaoForm({ unidade, onSubmit, onCancel, isSubmitting, submitError }: RegistrarMedicaoFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateValorFormData>({
    resolver: zodResolver(createValorSchema),
    defaultValues: { valor: "", data_referencia: "", observacao: "" },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <FormField
          label={`Valor (${unidade})`}
          type="number"
          step="any"
          placeholder="Ex: 45000"
          error={errors.valor?.message}
          {...register("valor")}
        />
        <FormField label="Data de referência" type="date" error={errors.data_referencia?.message} {...register("data_referencia")} />
      </div>

      <TextareaField
        label="Observação"
        placeholder="Contexto desta medição (opcional)"
        error={errors.observacao?.message}
        {...register("observacao")}
      />

      {submitError && <ErrorMessage>{submitError}</ErrorMessage>}

      <div className="flex gap-3 pt-1">
        <Button type="button" variant="secondary" size="lg" className="flex-1" onClick={onCancel} disabled={isSubmitting}>
          Cancelar
        </Button>
        <Button type="submit" size="lg" className="flex-1" isLoading={isSubmitting}>
          Registrar medição
        </Button>
      </div>
    </form>
  );
}
