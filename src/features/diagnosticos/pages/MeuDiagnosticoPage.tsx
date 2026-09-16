import { useMemo } from "react";
import { Navigate } from "react-router-dom";

import { getErrorMessage } from "@/lib/get-error-message";

import { ErrorMessage } from "@/components/feedback/ErrorMessage";
import { Loading } from "@/components/feedback/Loading";
import { Card } from "@/components/ui/Card";
import { AppLayout } from "@/layouts/AppLayout";
import { useAuth } from "@/hooks/useAuth";
import { diagnosticoDetalhePath } from "@/constants/routes";

import { useDiagnosticosQuery } from "@/features/diagnosticos/hooks/useDiagnosticosQuery";

/**
 * Ponto de entrada do menu "Diagnóstico" para o perfil EMPRESA — não é uma
 * tela com conteúdo próprio, só resolve QUAL diagnóstico mostrar e
 * redireciona. empresa_id vem sempre de user.empresa_id (nunca de um
 * parâmetro de URL, nunca editável) — ver GET /diagnosticos?empresa_id=.
 *
 * Três estados possíveis:
 *  - nenhum diagnóstico encontrado -> mensagem, sem redirecionar
 *  - existe um com status != CONCLUIDO -> manda pra DiagnosticoDetalhePage,
 *    que já é o formulário de resposta (perguntas por área, escala
 *    dinâmica, finalizar via /pendencias)
 *  - só existem CONCLUIDO -> mesma rota, mas a página já sabe mostrar o
 *    resultado em vez do formulário quando o status é CONCLUIDO
 */
export function MeuDiagnosticoPage() {
  const { user } = useAuth();
  const empresaId = user?.empresa_id;

  const {
    data: diagnosticos,
    isLoading,
    isError,
    error,
  } = useDiagnosticosQuery(empresaId ? [empresaId] : []);

  const alvo = useMemo(() => {
    if (!diagnosticos || diagnosticos.length === 0) return undefined;
    const emAndamento = diagnosticos.find((item) => item.status !== "CONCLUIDO");
    if (emAndamento) return emAndamento;
    return [...diagnosticos].sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
    )[0];
  }, [diagnosticos]);

  if (!empresaId) {
    return (
      <AppLayout>
        <ErrorMessage>Não foi possível identificar a empresa deste usuário.</ErrorMessage>
      </AppLayout>
    );
  }

  if (isLoading) {
    return (
      <AppLayout>
        <Loading label="Carregando diagnóstico…" />
      </AppLayout>
    );
  }

  if (isError) {
    return (
      <AppLayout>
        <ErrorMessage>{getErrorMessage(error, "Não foi possível carregar o diagnóstico.")}</ErrorMessage>
      </AppLayout>
    );
  }

  if (!alvo) {
    return (
      <AppLayout>
        <h1 className="font-display text-2xl text-ink-900">Diagnóstico</h1>
        <Card className="mt-6 flex flex-col items-center gap-2 px-6 py-16 text-center">
          <p className="text-sm font-medium text-ink-900">Nenhum diagnóstico atribuído ainda.</p>
          <p className="max-w-sm text-sm text-ink-500">
            Assim que um consultor criar um diagnóstico para sua empresa, ele aparece aqui.
          </p>
        </Card>
      </AppLayout>
    );
  }

  return <Navigate to={diagnosticoDetalhePath(alvo.id, empresaId)} replace />;
}
