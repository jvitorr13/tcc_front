import { zodResolver } from "@hookform/resolvers/zod";
import { Building2, Save } from "lucide-react";
import { useForm } from "react-hook-form";

import { ErrorMessage } from "@/components/feedback/ErrorMessage";
import { FormField } from "@/components/forms/FormField";
import { RadioGroupField } from "@/components/forms/RadioGroupField";
import { Button } from "@/components/ui/Button";

import { STATUS_OPTIONS } from "@/constants/status";
import { empresaSchema, type EmpresaFormData } from "@/features/empresas/schemas/empresa.schema";

export interface EmpresaFormProps {
  mode: "create" | "edit";
  defaultValues?: EmpresaFormData;
  onSubmit: (data: EmpresaFormData) => void | Promise<void>;
  onCancel: () => void;
  isSubmitting: boolean;
  submitError?: string | null;
}

const EMPTY_DEFAULTS: EmpresaFormData = {
  razao_social: "",
  nome_fantasia: "",
  cnpj: "",
  email: "",
  telefone: "",
  endereco: "",
  status: "ATIVO",
};

/**
 * Um só formulário para criar e editar empresa (os campos são idênticos nos
 * dois casos, diferente do usuário) — `mode` só troca o rótulo/ícone do
 * botão de submit.
 */
export function EmpresaForm({ mode, defaultValues, onSubmit, onCancel, isSubmitting, submitError }: EmpresaFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<EmpresaFormData>({
    resolver: zodResolver(empresaSchema),
    defaultValues: defaultValues ?? EMPTY_DEFAULTS,
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
      <div className="grid grid-cols-1 gap-x-4 gap-y-5 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <FormField
            label="Razão social"
            placeholder="Razão social da empresa"
            error={errors.razao_social?.message}
            {...register("razao_social")}
          />
        </div>

        <FormField
          label="Nome fantasia"
          placeholder="Nome fantasia"
          error={errors.nome_fantasia?.message}
          {...register("nome_fantasia")}
        />

        <FormField
          label="CNPJ"
          placeholder="00.000.000/0001-00"
          error={errors.cnpj?.message}
          {...register("cnpj")}
        />

        <FormField
          label="E-mail"
          type="email"
          placeholder="contato@empresa.com"
          error={errors.email?.message}
          {...register("email")}
        />

        <FormField
          label="Telefone"
          placeholder="(11) 99999-9999"
          error={errors.telefone?.message}
          {...register("telefone")}
        />

        <div className="sm:col-span-2">
          <FormField
            label="Endereço"
            placeholder="Rua, número, bairro, cidade"
            error={errors.endereco?.message}
            {...register("endereco")}
          />
        </div>

        <div className="sm:col-span-2">
          <RadioGroupField
            legend="Status"
            name="status"
            options={STATUS_OPTIONS}
            register={register}
            error={errors.status?.message}
          />
        </div>
      </div>

      {submitError && (
        <div className="rounded-lg border border-danger-500/20 bg-danger-50 px-3.5 py-2.5">
          <ErrorMessage className="mt-0">{submitError}</ErrorMessage>
        </div>
      )}

      <div className="flex gap-3 pt-1">
        <Button
          type="button"
          variant="secondary"
          size="lg"
          className="flex-1"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          Cancelar
        </Button>
        <Button type="submit" size="lg" className="flex-1" isLoading={isSubmitting}>
          {!isSubmitting && (mode === "create" ? <Building2 size={17} /> : <Save size={17} />)}
          {mode === "create" ? "Cadastrar" : "Salvar"}
        </Button>
      </div>
    </form>
  );
}
