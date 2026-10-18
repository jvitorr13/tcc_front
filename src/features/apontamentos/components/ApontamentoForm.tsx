import { zodResolver } from "@hookform/resolvers/zod";
import { Lock } from "lucide-react";
import { Controller, useForm, useWatch } from "react-hook-form";

import { ErrorMessage } from "@/components/feedback/ErrorMessage";
import { SelectField } from "@/components/forms/SelectField";
import { Button } from "@/components/ui/Button";
import { Label } from "@/components/ui/Label";
import { Switch } from "@/components/ui/Switch";
import { Textarea } from "@/components/ui/Textarea";
import { cn } from "@/utils/cn";

import type { VinculoOption } from "@/features/apontamentos/hooks/useVinculosDaEmpresa";
import {
  APONTAMENTO_TEXTO_MAX,
  apontamentoSchema,
  type ApontamentoFormData,
} from "@/features/apontamentos/schemas/apontamento.schema";
import type { VinculoFixo } from "@/features/apontamentos/types/apontamento.types";

export interface ApontamentoFormProps {
  mode: "create" | "edit";
  /** Edição: texto e visibilidade atuais. */
  defaultValues?: Pick<ApontamentoFormData, "texto" | "compartilhar">;
  /** Criação a partir de uma tarefa/diagnóstico: vínculo já preenchido e travado. */
  vinculoFixo?: VinculoFixo;
  /** Edição: vínculo atual só para leitura (ex.: "Tarefa: Padronizar vendas"). */
  vinculoLeitura?: string;
  diagnosticos: VinculoOption[];
  tarefas: VinculoOption[];
  isLoadingVinculos?: boolean;
  onSubmit: (data: ApontamentoFormData) => void | Promise<void>;
  onCancel: () => void;
  isSubmitting: boolean;
  submitError?: string | null;
}

function VinculoSomenteLeitura({ texto, travado }: { texto: string; travado?: boolean }) {
  return (
    <div>
      <Label>Vínculo</Label>
      <p className="flex min-h-11 items-center gap-2 rounded-lg border border-ink-900/10 bg-canvas px-3.5 py-2 text-sm text-ink-700">
        {travado && <Lock size={14} className="shrink-0 text-ink-500" aria-hidden />}
        {texto}
      </p>
    </div>
  );
}

/**
 * Formulário de apontamento (criar e editar). Só valida e chama onSubmit;
 * quem monta o payload e chama a API é o ApontamentosPanel. Na edição, o
 * vínculo aparece só pra leitura — a API não deixa mudar.
 */
export function ApontamentoForm({
  mode,
  defaultValues,
  vinculoFixo,
  vinculoLeitura,
  diagnosticos,
  tarefas,
  isLoadingVinculos,
  onSubmit,
  onCancel,
  isSubmitting,
  submitError,
}: ApontamentoFormProps) {
  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<ApontamentoFormData>({
    resolver: zodResolver(apontamentoSchema),
    defaultValues: {
      texto: defaultValues?.texto ?? "",
      // Sempre começa desligado na criação: compartilhar é uma decisão explícita.
      compartilhar: defaultValues?.compartilhar ?? false,
      vinculo_tipo: vinculoFixo?.tipo ?? "NENHUM",
      diagnostico_id: vinculoFixo?.tipo === "DIAGNOSTICO" ? vinculoFixo.id : "",
      tarefa_id: vinculoFixo?.tipo === "TAREFA" ? vinculoFixo.id : "",
    },
  });

  const [texto, vinculoTipo] = useWatch({ control, name: ["texto", "vinculo_tipo"] });
  const tamanho = texto?.trim().length ?? 0;

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
      <div>
        <Label htmlFor="apontamento-texto">Apontamento</Label>
        <Textarea
          id="apontamento-texto"
          rows={6}
          placeholder="Ex.: Reunião com a diretoria: fluxo de caixa semanal implantado, mas sem conciliação bancária."
          hasError={Boolean(errors.texto)}
          aria-invalid={Boolean(errors.texto)}
          disabled={isSubmitting}
          {...register("texto")}
        />
        <div className="mt-1 flex items-start justify-between gap-3">
          <ErrorMessage className="mt-0">{errors.texto?.message}</ErrorMessage>
          <span
            className={cn(
              "ml-auto shrink-0 text-xs tabular-nums",
              tamanho > APONTAMENTO_TEXTO_MAX ? "font-medium text-danger-600" : "text-ink-500",
            )}
          >
            {tamanho}/{APONTAMENTO_TEXTO_MAX}
          </span>
        </div>
      </div>

      {mode === "edit" ? (
        <VinculoSomenteLeitura texto={vinculoLeitura || "Nenhum"} />
      ) : vinculoFixo ? (
        <VinculoSomenteLeitura texto={vinculoFixo.label} travado />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-[10rem_1fr]">
          <SelectField label="Vínculo" disabled={isSubmitting} {...register("vinculo_tipo")}>
            <option value="NENHUM">Nenhum</option>
            <option value="DIAGNOSTICO">Diagnóstico</option>
            <option value="TAREFA">Tarefa</option>
          </SelectField>

          {vinculoTipo === "DIAGNOSTICO" && (
            <SelectField
              label="Diagnóstico"
              error={errors.diagnostico_id?.message}
              disabled={isSubmitting || isLoadingVinculos}
              {...register("diagnostico_id")}
            >
              <option value="">
                {isLoadingVinculos
                  ? "Carregando…"
                  : diagnosticos.length === 0
                    ? "Esta empresa não tem diagnósticos"
                    : "Escolha o diagnóstico"}
              </option>
              {diagnosticos.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </SelectField>
          )}

          {vinculoTipo === "TAREFA" && (
            <SelectField
              label="Tarefa"
              error={errors.tarefa_id?.message}
              disabled={isSubmitting || isLoadingVinculos}
              {...register("tarefa_id")}
            >
              <option value="">
                {isLoadingVinculos
                  ? "Carregando…"
                  : tarefas.length === 0
                    ? "Esta empresa não tem tarefas"
                    : "Escolha a tarefa"}
              </option>
              {tarefas.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </SelectField>
          )}
        </div>
      )}

      <Controller
        control={control}
        name="compartilhar"
        render={({ field }) => (
          <Switch
            id="apontamento-compartilhar"
            checked={field.value}
            onChange={field.onChange}
            disabled={isSubmitting}
            label="Compartilhar com a empresa"
            description={field.value ? "A empresa poderá ver este apontamento" : "Só você vê este apontamento"}
          />
        )}
      />

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
          {mode === "edit" ? "Salvar alterações" : "Registrar apontamento"}
        </Button>
      </div>
    </form>
  );
}
