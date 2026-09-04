import { zodResolver } from "@hookform/resolvers/zod";
import { ClipboardCheck } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";

import { ErrorMessage } from "@/components/feedback/ErrorMessage";
import { FormField } from "@/components/forms/FormField";
import { SelectField } from "@/components/forms/SelectField";
import { TextareaField } from "@/components/forms/TextareaField";
import { Button } from "@/components/ui/Button";
import { Label } from "@/components/ui/Label";
import { Select } from "@/components/ui/Select";
import { formatDate } from "@/utils/format";

import type { Diagnostico } from "@/features/diagnosticos";
import type { Empresa } from "@/features/empresas";
import {
  createPlanoAcaoSchema,
  type CreatePlanoAcaoFormData,
} from "@/features/plano-acao/schemas/create-plano-acao.schema";

export interface CreatePlanoAcaoFormProps {
  empresas: Empresa[];
  diagnosticos: Diagnostico[];
  defaultEmpresaId?: string;
  defaultDiagnosticoId?: string;
  onSubmit: (data: CreatePlanoAcaoFormData) => void | Promise<void>;
  onCancel: () => void;
  isSubmitting: boolean;
  submitError?: string | null;
}

const STATUS_LABELS: Record<Diagnostico["status"], string> = {
  RASCUNHO: "Rascunho",
  EM_ANDAMENTO: "Em andamento",
  CONCLUIDO: "Concluído",
};

/**
 * O select de Empresa aqui é só um filtro local pra encurtar a lista de
 * diagnósticos — não é um campo do formulário nem vai no payload
 * (diagnostico_id é o único vínculo enviado; empresa/consultor são
 * herdados do diagnóstico pelo back-end).
 */
export function CreatePlanoAcaoForm({
  empresas,
  diagnosticos,
  defaultEmpresaId,
  defaultDiagnosticoId,
  onSubmit,
  onCancel,
  isSubmitting,
  submitError,
}: CreatePlanoAcaoFormProps) {
  const [empresaFilter, setEmpresaFilter] = useState(defaultEmpresaId ?? "");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreatePlanoAcaoFormData>({
    resolver: zodResolver(createPlanoAcaoSchema),
    defaultValues: { diagnostico_id: defaultDiagnosticoId ?? "", titulo: "", descricao: "" },
  });

  const diagnosticosVisiveis = diagnosticos.filter(
    (diagnostico) => !empresaFilter || diagnostico.empresa_id === empresaFilter,
  );

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
      <div>
        <Label htmlFor="plano-empresa-filtro">Empresa</Label>
        <Select id="plano-empresa-filtro" value={empresaFilter} onChange={(event) => setEmpresaFilter(event.target.value)}>
          <option value="">Todas as empresas</option>
          {empresas.map((empresa) => (
            <option key={empresa.id} value={empresa.id}>
              {empresa.nome_fantasia || empresa.razao_social}
            </option>
          ))}
        </Select>
      </div>

      <SelectField label="Diagnóstico" error={errors.diagnostico_id?.message} {...register("diagnostico_id")}>
        <option value="">Selecione o diagnóstico</option>
        {diagnosticosVisiveis.map((diagnostico) => (
          <option key={diagnostico.id} value={diagnostico.id}>
            {diagnostico.nome} — {STATUS_LABELS[diagnostico.status]}
            {diagnostico.data_conclusao ? ` (${formatDate(diagnostico.data_conclusao)})` : ""}
          </option>
        ))}
      </SelectField>

      {diagnosticosVisiveis.length === 0 && (
        <p className="rounded-lg border border-gold-500/25 bg-gold-100/40 px-3.5 py-2.5 text-sm text-ink-700">
          Nenhum diagnóstico encontrado para essa empresa.
        </p>
      )}

      <FormField
        label="Título do plano"
        placeholder="Ex: Melhoria Financeira"
        error={errors.titulo?.message}
        {...register("titulo")}
      />

      <TextareaField
        label="Descrição"
        placeholder="Contexto ou objetivo deste plano (opcional)"
        error={errors.descricao?.message}
        {...register("descricao")}
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
          {!isSubmitting && <ClipboardCheck size={17} />}
          Criar plano de ação
        </Button>
      </div>
    </form>
  );
}
