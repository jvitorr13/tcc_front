import { zodResolver } from "@hookform/resolvers/zod";
import { Save } from "lucide-react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";

import { ErrorMessage } from "@/components/feedback/ErrorMessage";
import { FormField } from "@/components/forms/FormField";
import { RadioGroupField } from "@/components/forms/RadioGroupField";
import { SelectField } from "@/components/forms/SelectField";
import { Button } from "@/components/ui/Button";

import { STATUS_OPTIONS } from "@/constants/status";
import type { Empresa } from "@/features/empresas";
import { TIPO_USUARIO_OPTIONS } from "@/features/users/constants";
import { editUserSchema, type EditUserFormData } from "@/features/users/schemas/edit-user.schema";

export interface EditUserFormProps {
  defaultValues: EditUserFormData;
  empresas: Empresa[];
  onSubmit: (data: EditUserFormData) => void | Promise<void>;
  onCancel: () => void;
  isSubmitting: boolean;
  submitError?: string | null;
  /** 409 "já existe um usuário com este email" — vai direto no campo, não banner. */
  conflictError?: string | null;
}

/**
 * Mesmo espírito do CreateUserForm, sem os campos de senha — editar perfil
 * aqui não troca credenciais. `defaultValues` vem pronto da página (o
 * usuário já carregado via useUserQuery), então o form nasce preenchido.
 */
export function EditUserForm({
  defaultValues,
  empresas,
  onSubmit,
  onCancel,
  isSubmitting,
  submitError,
  conflictError,
}: EditUserFormProps) {
  const {
    register,
    handleSubmit,
    watch,
    setError,
    formState: { errors },
  } = useForm<EditUserFormData>({
    resolver: zodResolver(editUserSchema),
    defaultValues,
  });

  const tipoUsuario = watch("tipo_usuario");

  useEffect(() => {
    if (conflictError) setError("email", { type: "manual", message: conflictError });
  }, [conflictError, setError]);

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
      <FormField
        label="Nome"
        autoComplete="name"
        placeholder="Nome completo"
        error={errors.nome?.message}
        {...register("nome")}
      />

      <FormField
        label="E-mail"
        type="email"
        autoComplete="email"
        placeholder="voce@empresa.com"
        error={errors.email?.message}
        {...register("email")}
      />

      <RadioGroupField
        legend="Tipo de usuário"
        name="tipo_usuario"
        options={TIPO_USUARIO_OPTIONS}
        register={register}
        error={errors.tipo_usuario?.message}
      />

      {tipoUsuario === "EMPRESA" && (
        <SelectField label="Empresa vinculada" error={errors.empresa_id?.message} {...register("empresa_id")}>
          <option value="">Selecione a empresa</option>
          {empresas.map((empresa) => (
            <option key={empresa.id} value={empresa.id}>
              {empresa.nome_fantasia || empresa.razao_social}
            </option>
          ))}
        </SelectField>
      )}

      <RadioGroupField
        legend="Status"
        name="status"
        options={STATUS_OPTIONS}
        register={register}
        error={errors.status?.message}
      />

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
          {!isSubmitting && <Save size={17} />}
          Salvar
        </Button>
      </div>
    </form>
  );
}
