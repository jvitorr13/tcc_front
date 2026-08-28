import { ArrowLeft, Plus } from "lucide-react";
import { useState } from "react";
import { Link, useLocation } from "react-router-dom";

import { getErrorMessage } from "@/lib/get-error-message";

import { ErrorMessage } from "@/components/feedback/ErrorMessage";
import { Loading } from "@/components/feedback/Loading";
import { SuccessMessage } from "@/components/feedback/SuccessMessage";
import { Card } from "@/components/ui/Card";
import { AppLayout } from "@/layouts/AppLayout";
import { ROUTES } from "@/constants/routes";

import { ModelosTable } from "@/features/questionario/components/ModelosTable";
import { useAtivarModeloMutation } from "@/features/questionario/hooks/useAtivarModeloMutation";
import { useModelosQuery } from "@/features/questionario/hooks/useModelosQuery";
import type { Modelo } from "@/features/questionario/types/modelo.types";

interface ModelosListLocationState {
  successMessage?: string;
}

/**
 * Subárea de Diagnósticos (não tem entrada própria no menu lateral — ver
 * botão "Modelos de diagnóstico" em DiagnosticosListPage). Sem GET de
 * áreas/perguntas no back-end não há tela de edição: só listar, criar e
 * ativar.
 */
export function ModelosListPage() {
  const location = useLocation();
  const [successMessage, setSuccessMessage] = useState(
    () => (location.state as ModelosListLocationState | null)?.successMessage ?? null,
  );
  const [ativarError, setAtivarError] = useState<string | null>(null);
  const [ativandoId, setAtivandoId] = useState<string | null>(null);

  const { data: modelos, isLoading, isError, error } = useModelosQuery();
  const ativarMutation = useAtivarModeloMutation();

  async function handleAtivar(modelo: Modelo) {
    setAtivarError(null);
    setSuccessMessage(null);
    setAtivandoId(modelo.id);
    try {
      await ativarMutation.mutateAsync(modelo.id);
      setSuccessMessage(`Modelo "${modelo.nome}" ativado. Já pode ser usado em novos diagnósticos.`);
    } catch (err) {
      setAtivarError(getErrorMessage(err, "Não foi possível ativar o modelo."));
    } finally {
      setAtivandoId(null);
    }
  }

  return (
    <AppLayout>
      <Link
        to={ROUTES.diagnosticos}
        className="inline-flex items-center gap-1.5 text-sm font-medium text-ink-600 transition-colors hover:text-ink-900"
      >
        <ArrowLeft size={15} />
        Diagnósticos
      </Link>

      <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-2xl text-ink-900">Modelos de diagnóstico</h1>
        <Link
          to={ROUTES.questionarioModelosNovo}
          className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-ink-900 px-4 text-sm font-medium text-white transition-colors hover:bg-ink-800"
        >
          <Plus size={16} />
          Novo modelo
        </Link>
      </div>

      <Card className="mt-6 p-6">
        {successMessage && <SuccessMessage className="mb-5">{successMessage}</SuccessMessage>}
        {ativarError && <ErrorMessage className="mb-5">{ativarError}</ErrorMessage>}

        {isLoading && <Loading label="Carregando modelos…" />}

        {isError && <ErrorMessage>{getErrorMessage(error, "Não foi possível carregar os modelos.")}</ErrorMessage>}

        {!isLoading && !isError && (modelos ?? []).length === 0 && (
          <p className="py-10 text-center text-sm text-ink-500">Nenhum modelo de diagnóstico cadastrado ainda.</p>
        )}

        {!isLoading && !isError && (modelos ?? []).length > 0 && (
          <ModelosTable
            modelos={modelos ?? []}
            onAtivar={handleAtivar}
            isAtivando={(id) => ativandoId === id && ativarMutation.isPending}
          />
        )}
      </Card>
    </AppLayout>
  );
}
