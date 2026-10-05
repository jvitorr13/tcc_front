import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

import { getErrorMessage } from "@/lib/get-error-message";

import { ErrorMessage } from "@/components/feedback/ErrorMessage";
import { Loading } from "@/components/feedback/Loading";
import { Card } from "@/components/ui/Card";
import { formatDecimal } from "@/utils/format";

import { EvolucaoChart } from "@/features/evolucao/components/EvolucaoChart";
import { VariacaoBadge } from "@/features/evolucao/components/VariacaoBadge";
import { useEmpresaEvolucaoQuery } from "@/features/evolucao/hooks/useEmpresaEvolucaoQuery";

export interface EvolucaoDetalheProps {
  empresaId: string;
  /** Sublinha o título com o nome da empresa — usado quando quem vê pode ser mais de uma (CONSULTOR); omitir quando é sempre "a própria" (EMPRESA). */
  empresaNome?: string;
  /** Link de volta opcional (CONSULTOR chegou aqui a partir de uma lista; EMPRESA não precisa, é a própria tela). */
  voltar?: { to: string; label: string };
}

/**
 * Conteúdo da tela de evolução de uma empresa (GET /empresas/:id/evolucao)
 * — sem <AppLayout> próprio, quem chama envolve. Único lugar que sabe
 * desenhar isso; usado tanto pelo drill-down do CONSULTOR
 * (EmpresaEvolucaoPage, uma empresa entre várias) quanto direto pela
 * EMPRESA (EvolucoesListPage, a própria) — nenhuma duplicação de tela.
 *
 * Os 3 estados (0, 1, 2+ diagnósticos) e a variação vêm prontos do
 * back-end; nada é recalculado ou reordenado aqui.
 */
export function EvolucaoDetalhe({ empresaId, empresaNome, voltar }: EvolucaoDetalheProps) {
  const { data, isLoading, isError, error } = useEmpresaEvolucaoQuery(empresaId);

  const voltarLink = voltar && (
    <Link
      to={voltar.to}
      className="inline-flex items-center gap-1.5 text-sm font-medium text-ink-600 transition-colors hover:text-ink-900"
    >
      <ArrowLeft size={15} />
      {voltar.label}
    </Link>
  );

  if (isLoading) {
    return <Loading label="Carregando evolução…" />;
  }

  if (isError || !data) {
    return (
      <div>
        {voltarLink}
        <ErrorMessage className={voltar ? "mt-4" : undefined}>
          {getErrorMessage(error, "Não foi possível carregar a evolução.")}
        </ErrorMessage>
      </div>
    );
  }

  // diagnosticos vem ordenado ascendente pelo back-end — o último item do
  // array é sempre o mais recente. Nunca reordenar aqui.
  const ultimoDiagnostico = data.diagnosticos[data.diagnosticos.length - 1];

  return (
    <div>
      {voltarLink}

      <div className={voltar ? "mt-4" : undefined}>
        <h1 className="font-display text-2xl text-ink-900">Evolução</h1>
        {empresaNome && <p className="mt-1 text-sm text-ink-600">{empresaNome}</p>}
      </div>

      <div className="mt-4">
        <VariacaoBadge variacao={data.variacao_media_geral} desde={data.variacao_desde} />
      </div>

      <Card className="mt-6 p-6">
        <h2 className="font-display text-lg text-ink-900">Evolução da média geral</h2>

        {data.diagnosticos.length === 0 ? (
          <p className="py-10 text-center text-sm text-ink-500">Nenhum diagnóstico concluído ainda.</p>
        ) : (
          <div className="mt-4">
            <EvolucaoChart diagnosticos={data.diagnosticos} />
          </div>
        )}
      </Card>

      {ultimoDiagnostico && ultimoDiagnostico.areas.length > 0 && (
        <Card className="mt-6 p-6">
          <h2 className="font-display text-lg text-ink-900">Por área · último diagnóstico</h2>
          <div className="mt-4 grid grid-cols-1 gap-x-8 gap-y-2.5 sm:grid-cols-2">
            {ultimoDiagnostico.areas.map((area) => (
              <div key={area.nome} className="flex items-center justify-between text-sm">
                <span className="text-ink-700">{area.nome}</span>
                <span className="font-medium text-ink-900">{formatDecimal(area.media)}</span>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
