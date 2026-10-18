import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { ErrorMessage } from "@/components/feedback/ErrorMessage";
import { FormField } from "@/components/forms/FormField";
import { SelectField } from "@/components/forms/SelectField";
import { TextareaField } from "@/components/forms/TextareaField";
import { Button } from "@/components/ui/Button";

import { createTarefaSchema, type CreateTarefaFormData } from "@/features/plano-acao/schemas/create-tarefa.schema";

export interface ResponsavelOption {
  id: string;
  nome: string;
  email?: string;
}

export interface CreateTarefaFormProps {
  /** Usuários vinculados à empresa do plano de ação — só eles podem ser responsáveis. */
  responsaveis: ResponsavelOption[];
  isLoadingResponsaveis?: boolean;
  onSubmit: (data: CreateTarefaFormData) => void | Promise<void>;
  onCancel: () => void;
  isSubmitting: boolean;
  submitError?: string | null;
}

/**
 * Não envia status — a tarefa nasce com o padrão do back-end (PENDENTE). O
 * responsável é escolhido numa lista de pessoas da empresa do plano e vai
 * como `responsavel_id`.
 */
export function CreateTarefaForm({
  responsaveis,
  isLoadingResponsaveis,
  onSubmit,
  onCancel,
  isSubmitting,
  submitError,
}: CreateTarefaFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateTarefaFormData>({
    resolver: zodResolver(createTarefaSchema),
    defaultValues: { titulo: "", descricao: "", responsavel_id: responsaveis.length === 1 ? responsaveis[0].id : "", prazo: "", prioridade: "MEDIA" },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
      <FormField label="Título" placeholder="Ex: Implantar controle financeiro" error={errors.titulo?.message} {...register("titulo")} />

      <TextareaField label="Descrição" placeholder="Detalhes da tarefa (opcional)" error={errors.descricao?.message} {...register("descricao")} />

      <div>
        <SelectField
          label="Responsável"
          error={errors.responsavel_id?.message}
          disabled={isLoadingResponsaveis || responsaveis.length === 0}
          {...register("responsavel_id")}
        >
          <option value="">
            {isLoadingResponsaveis ? "Carregando pessoas da empresa…" : "Selecione quem vai executar a tarefa"}
          </option>
          {responsaveis.map((pessoa) => (
            <option key={pessoa.id} value={pessoa.id}>
              {pessoa.email ? `${pessoa.nome} (${pessoa.email})` : pessoa.nome}
            </option>
          ))}
        </SelectField>
        {!isLoadingResponsaveis && responsaveis.length === 0 && (
          <p className="mt-1.5 text-xs text-ink-500">
            Nenhuma pessoa ativa vinculada à empresa deste plano. Cadastre um usuário do tipo Empresa para ela em
            Usuários.
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <FormField label="Prazo" type="date" error={errors.prazo?.message} {...register("prazo")} />
        <SelectField label="Prioridade" error={errors.prioridade?.message} {...register("prioridade")}>
          <option value="BAIXA">Baixa</option>
          <option value="MEDIA">Média</option>
          <option value="ALTA">Alta</option>
        </SelectField>
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
          Adicionar tarefa
        </Button>
      </div>
    </form>
  );
}
