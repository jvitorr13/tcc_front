import { zodResolver } from "@hookform/resolvers/zod";
import { ClipboardCheck } from "lucide-react";
import { useForm } from "react-hook-form";

import { ErrorMessage } from "@/components/feedback/ErrorMessage";
import { FormField } from "@/components/forms/FormField";
import { SelectField } from "@/components/forms/SelectField";
import { TextareaField } from "@/components/forms/TextareaField";
import { Button } from "@/components/ui/Button";

import type { Empresa } from "@/features/empresas";
import {
  createIndicadorSchema,
  type CreateIndicadorFormData,
} from "@/features/indicadores/schemas/create-indicador.schema";

export interface CreateIndicadorFormProps {
  empresas: Empresa[];
  defaultEmpresaId?: string;
  onSubmit: (data: CreateIndicadorFormData) => void | Promise<void>;
  onCancel: () => void;
  isSubmitting: boolean;
  submitError?: string | null;
}

export function CreateIndicadorForm({
  empresas,
  defaultEmpresaId,
  onSubmit,
  onCancel,
  isSubmitting,
  submitError,
}: CreateIndicadorFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateIndicadorFormData>({
    resolver: zodResolver(createIndicadorSchema),
    defaultValues: {
      empresa_id: defaultEmpresaId ?? "",
      nome: "",
      descricao: "",
      unidade: "",
      meta: "",
      periodicidade: "MENSAL",
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
      <SelectField label="Empresa" error={errors.empresa_id?.message} {...register("empresa_id")}>
        <option value="">Selecione a empresa</option>
        {empresas.map((empresa) => (
          <option key={empresa.id} value={empresa.id}>
            {empresa.nome_fantasia || empresa.razao_social}
          </option>
        ))}
      </SelectField>

      <FormField label="Nome" placeholder="Ex: Faturamento mensal" error={errors.nome?.message} {...register("nome")} />

      <TextareaField
        label="Descrição"
        placeholder="Contexto do indicador (opcional)"
        error={errors.descricao?.message}
        {...register("descricao")}
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <FormField label="Unidade" placeholder='Ex: "R$", "%", "quantidade"' error={errors.unidade?.message} {...register("unidade")} />
        <FormField label="Meta" type="number" step="any" placeholder="Opcional" error={errors.meta?.message} {...register("meta")} />
      </div>

      <SelectField label="Periodicidade" error={errors.periodicidade?.message} {...register("periodicidade")}>
        <option value="MENSAL">Mensal</option>
        <option value="TRIMESTRAL">Trimestral</option>
        <option value="SEMESTRAL">Semestral</option>
        <option value="ANUAL">Anual</option>
      </SelectField>

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
          Criar indicador
        </Button>
      </div>
    </form>
  );
}
