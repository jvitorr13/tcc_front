import { zodResolver } from "@hookform/resolvers/zod";
import { UserPlus } from "lucide-react";
import { useForm } from "react-hook-form";

import { ErrorMessage } from "@/components/feedback/ErrorMessage";
import { FormField } from "@/components/forms/FormField";
import { RadioGroupField } from "@/components/forms/RadioGroupField";
import { SelectField } from "@/components/forms/SelectField";
import { Button } from "@/components/ui/Button";

import { STATUS_OPTIONS } from "@/constants/status";
import type { Empresa } from "@/features/empresas";
import { TIPO_USUARIO_OPTIONS } from "@/features/users/constants";
import { createUserSchema, type CreateUserFormData } from "@/features/users/schemas/create-user.schema";

export interface CreateUserFormProps {
  empresas: Empresa[];
  onSubmit: (data: CreateUserFormData) => void | Promise<void>;
  onCancel: () => void;
  isSubmitting: boolean;
  submitError?: string | null;
}

/**
 * Formulário de cadastro de usuário puro — só valida e dispara onSubmit,
 * assim como LoginForm/RegisterForm. Quem decide o que fazer (chamar a API,
 * navegar de volta para a lista) é a página (CreateUserPage); a lista de
 * empresas também vem pronta por prop pelo mesmo motivo — o form não sabe
 * de nenhum service.
 */
export function CreateUserForm({ empresas, onSubmit, onCancel, isSubmitting, submitError }: CreateUserFormProps) {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<CreateUserFormData>({
    resolver: zodResolver(createUserSchema),
    defaultValues: {
      nome: "",
      email: "",
      senha: "",
      confirmarSenha: "",
      tipo_usuario: "CONSULTOR",
      empresa_id: "",
      status: "ATIVO",
    },
  });

  const tipoUsuario = watch("tipo_usuario");

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

      <FormField
        label="Senha"
        isPassword
        autoComplete="new-password"
        placeholder="••••••••"
        error={errors.senha?.message}
        {...register("senha")}
      />

      <FormField
        label="Confirmar senha"
        isPassword
        autoComplete="new-password"
        placeholder="••••••••"
        error={errors.confirmarSenha?.message}
        {...register("confirmarSenha")}
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
          {!isSubmitting && <UserPlus size={17} />}
          Cadastrar
        </Button>
      </div>
    </form>
  );
}
