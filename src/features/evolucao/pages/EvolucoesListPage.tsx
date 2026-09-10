import { ChevronRight, TrendingUp } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";

import { getErrorMessage } from "@/lib/get-error-message";

import { ErrorMessage } from "@/components/feedback/ErrorMessage";
import { Loading } from "@/components/feedback/Loading";
import { Card } from "@/components/ui/Card";
import { SearchInput } from "@/components/ui/SearchInput";
import { AppLayout } from "@/layouts/AppLayout";
import { empresaEvolucaoPath } from "@/constants/routes";

import { useEmpresasQuery } from "@/features/empresas";

/**
 * Ponto de entrada do menu lateral: a evolução em si é por empresa (GET
 * /empresas/:id/evolucao), então esta tela só deixa escolher qual empresa
 * ver — mesmo padrão de DashboardsListPage.
 */
export function EvolucoesListPage() {
  const { data: empresas, isLoading, isError, error } = useEmpresasQuery();
  const [search, setSearch] = useState("");

  const term = search.trim().toLowerCase();
  const filteredEmpresas = (empresas ?? []).filter((empresa) => {
    if (!term) return true;
    return (
      (empresa.nome_fantasia || empresa.razao_social).toLowerCase().includes(term) ||
      empresa.razao_social.toLowerCase().includes(term)
    );
  });

  return (
    <AppLayout>
      <h1 className="font-display text-2xl text-ink-900">Evolução</h1>
      <p className="mt-1 text-sm text-ink-600">Comparação de resultados de diagnóstico de cada empresa ao longo do tempo.</p>

      <div className="mt-6 max-w-sm">
        <SearchInput
          placeholder="Buscar empresa"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          aria-label="Buscar empresa"
        />
      </div>

      <div className="mt-6">
        {isLoading && <Loading label="Carregando empresas…" />}

        {isError && <ErrorMessage>{getErrorMessage(error, "Não foi possível carregar as empresas.")}</ErrorMessage>}

        {!isLoading && !isError && filteredEmpresas.length === 0 && (
          <p className="py-10 text-center text-sm text-ink-500">Nenhuma empresa encontrada.</p>
        )}

        {!isLoading && !isError && filteredEmpresas.length > 0 && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredEmpresas.map((empresa) => (
              <Link key={empresa.id} to={empresaEvolucaoPath(empresa.id)}>
                <Card className="flex items-center justify-between gap-3 p-5 transition-colors hover:border-ink-900/20 hover:bg-ink-900/[0.02]">
                  <div className="flex items-center gap-3">
                    <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-gold-100 text-gold-600">
                      <TrendingUp size={18} />
                    </span>
                    <p className="text-sm font-medium text-ink-900">{empresa.nome_fantasia || empresa.razao_social}</p>
                  </div>
                  <ChevronRight size={17} className="shrink-0 text-ink-500" />
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
