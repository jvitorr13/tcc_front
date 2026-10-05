import { zodResolver } from "@hookform/resolvers/zod";
import { ClipboardCheck } from "lucide-react";
import { useForm } from "react-hook-form";
import { Link } from "react-router-dom";

import { ErrorMessage } from "@/components/feedback/ErrorMessage";
import { FormField } from "@/components/forms/FormField";
import { SelectField } from "@/components/forms/SelectField";
import { TextareaField } from "@/components/forms/TextareaField";
import { Button } from "@/components/ui/Button";
import { ROUTES } from "@/constants/routes";

import type { AuthUser } from "@/features/auth";
import type { Empresa } from "@/features/empresas";
import { getVersaoAtual, type Modelo } from "@/features/questionario";
import {
  createDiagnosticoSchema,
  type CreateDiagnosticoFormData,
} from "@/features/diagnosticos/schemas/create-diagnostico.schema";

export interface CreateDiagnosticoFormProps {
  empresas: Empresa[];
  consultores: AuthUser[];
  modelos: Modelo[];
  /** Preenche o campo Consultor já selecionado — normalmente quem está logado. */
  defaultConsultorId: string;
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
  consultores,
  modelos,
  defaultConsultorId,
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
      descricao: "",
      empresa_id: "",
      consultor_id: defaultConsultorId,
      modelo_id: "",
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

      <TextareaField
        label="Descrição"
        placeholder="Contexto ou objetivo deste diagnóstico (opcional)"
        error={errors.descricao?.message}
        {...register("descricao")}
      />

      <SelectField label="Empresa" error={errors.empresa_id?.message} {...register("empresa_id")}>
        <option value="">Selecione a empresa</option>
        {empresas.map((empresa) => (
          <option key={empresa.id} value={empresa.id}>
            {empresa.nome_fantasia || empresa.razao_social}
          </option>
        ))}
      </SelectField>

      <SelectField label="Consultor responsável" error={errors.consultor_id?.message} {...register("consultor_id")}>
        <option value="">Selecione o consultor</option>
        {consultores.map((consultor) => (
          <option key={consultor.id} value={consultor.id}>
            {consultor.nome}
          </option>
        ))}
      </SelectField>

      <SelectField label="Modelo de diagnóstico" error={errors.modelo_id?.message} {...register("modelo_id")}>
        <option value="">Selecione o modelo</option>
        {modelos.map((modelo) => (
          <option key={modelo.id} value={modelo.id}>
            {modelo.nome} — v{getVersaoAtual(modelo)?.numero_versao ?? "—"}
          </option>
        ))}
      </SelectField>

      {modelos.length === 0 && (
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
