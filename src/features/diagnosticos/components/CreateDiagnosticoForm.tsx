import { zodResolver } from "@hookform/resolvers/zod";
import { ClipboardCheck } from "lucide-react";
import { useForm } from "react-hook-form";
import { Link } from "react-router-dom";

import { ErrorMessage } from "@/components/feedback/ErrorMessage";
import { FormField } from "@/components/forms/FormField";
import { SelectField } from "@/components/forms/SelectField";
import { Button } from "@/components/ui/Button";
import { ROUTES } from "@/constants/routes";

import type { Empresa } from "@/features/empresas";
import { getVersaoAtual, type Modelo } from "@/features/questionario";
import {
  createDiagnosticoSchema,
  type CreateDiagnosticoFormData,
} from "@/features/diagnosticos/schemas/create-diagnostico.schema";

export interface CreateDiagnosticoFormProps {
  empresas: Empresa[];
  /** Modelo com versão ativa — é ele que o back-end vai aplicar (só informativo). */
  modeloAtivo: Modelo | undefined;
  onSubmit: (data: CreateDiagnosticoFormData) => void | Promise<void>;
  onCancel: () => void;
  isSubmitting: boolean;
  submitError?: string | null;
}

/**
 * Formulário de criação de diagnóstico puro — só valida e dispara
 * onSubmit, assim como os demais forms do sistema. A página
 * (CreateDiagnosticoPage) decide o que fazer com os dados (chamar a API).
 */
export function CreateDiagnosticoForm({
  empresas,
  modeloAtivo,
  onSubmit,
  onCancel,
  isSubmitting,
  submitError,
}: CreateDiagnosticoFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateDiagnosticoFormData>({
    resolver: zodResolver(createDiagnosticoSchema),
    defaultValues: {
      nome: "",
      empresa_id: "",
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
      <FormField
        label="Nome do diagnóstico"
        placeholder="Ex: Diagnóstico Q1 2026"
        error={errors.nome?.message}
        {...register("nome")}
      />

      <SelectField label="Empresa" error={errors.empresa_id?.message} {...register("empresa_id")}>
        <option value="">Selecione a empresa</option>
        {empresas.map((empresa) => (
          <option key={empresa.id} value={empresa.id}>
            {empresa.nome_fantasia || empresa.razao_social}
          </option>
        ))}
      </SelectField>

      {modeloAtivo && (
        <p className="text-sm text-ink-600">
          Modelo aplicado: <span className="font-medium text-ink-900">{modeloAtivo.nome}</span> — v
          {getVersaoAtual(modeloAtivo)?.numero_versao ?? "—"} (versão ativa)
        </p>
      )}

      {!modeloAtivo && (
        <p className="rounded-lg border border-gold-500/25 bg-gold-100/40 px-3.5 py-2.5 text-sm text-ink-700">
          Nenhum modelo de diagnóstico ativo ainda.{" "}
          <Link to={ROUTES.questionarioModelos} className="font-medium underline underline-offset-2">
            Crie e ative um modelo
          </Link>{" "}
          antes de criar um diagnóstico.
        </p>
      )}

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
          {!isSubmitting && <ClipboardCheck size={17} />}
          Criar diagnóstico
        </Button>
      </div>
    </form>
  );
}
