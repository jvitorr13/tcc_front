import { useCallback, useMemo } from "react";

// Caminhos diretos (não os index.ts): as telas de diagnóstico e de plano de
// ação importam este módulo, e passar pelos barrels criaria import circular.
import { useDiagnosticosQuery } from "@/features/diagnosticos/hooks/useDiagnosticosQuery";
import { useTarefasDaEmpresa } from "@/features/plano-acao/hooks/useTarefasDaEmpresa";

import type { Apontamento } from "@/features/apontamentos/types/apontamento.types";

export interface VinculoOption {
  id: string;
  label: string;
}

/**
 * Diagnósticos e tarefas DA EMPRESA, pra duas coisas: as opções de vínculo
 * do formulário e a etiqueta do card ("Tarefa: Padronizar vendas"). O
 * apontamento só traz os ids. Rotas usadas (GET /diagnosticos?empresa_id=,
 * GET /planos-acao?empresa_id= e GET /planos-acao/:id/tarefas) valem pros
 * dois perfis, cada um dentro do que pode ver.
 */
export function useVinculosDaEmpresa(empresaId: string | undefined) {
  const { data: diagnosticosData, isLoading: isLoadingDiagnosticos } = useDiagnosticosQuery(
    empresaId ? [empresaId] : [],
  );
  const { tarefas: tarefasData, isLoading: isLoadingTarefas } = useTarefasDaEmpresa(empresaId);

  const diagnosticos = useMemo<VinculoOption[]>(
    () => (diagnosticosData ?? []).map((diagnostico) => ({ id: diagnostico.id, label: diagnostico.nome })),
    [diagnosticosData],
  );
  const tarefas = useMemo<VinculoOption[]>(
    () => tarefasData.map((tarefa) => ({ id: tarefa.id, label: tarefa.titulo })),
    [tarefasData],
  );

  const labelDoVinculo = useCallback(
    (apontamento: Pick<Apontamento, "diagnostico_id" | "tarefa_id">): string[] => {
      const labels: string[] = [];
      if (apontamento.tarefa_id) {
        const tarefa = tarefas.find((item) => item.id === apontamento.tarefa_id);
        labels.push(tarefa ? `Tarefa: ${tarefa.label}` : "Tarefa vinculada");
      }
      if (apontamento.diagnostico_id) {
        const diagnostico = diagnosticos.find((item) => item.id === apontamento.diagnostico_id);
        labels.push(diagnostico ? `Diagnóstico: ${diagnostico.label}` : "Diagnóstico vinculado");
      }
      return labels;
    },
    [diagnosticos, tarefas],
  );

  return {
    diagnosticos,
    tarefas,
    labelDoVinculo,
    isLoading: isLoadingDiagnosticos || isLoadingTarefas,
  };
}
