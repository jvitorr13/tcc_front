import { ChevronRight, NotebookPen } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";

import { getErrorMessage } from "@/lib/get-error-message";

import { ErrorMessage } from "@/components/feedback/ErrorMessage";
import { Loading } from "@/components/feedback/Loading";
import { Card } from "@/components/ui/Card";
import { SearchInput } from "@/components/ui/SearchInput";
import { useAuth } from "@/hooks/useAuth";
import { AppLayout } from "@/layouts/AppLayout";
import { empresaApontamentosPath } from "@/constants/routes";

import { useEmpresasQuery } from "@/features/empresas";

import { ApontamentosPanel } from "@/features/apontamentos/components/ApontamentosPanel";

/**
 * Entrada do menu "Apontamentos" — mesma rota pros dois perfis (como
 * Evolução):
 *  - CONSULTOR: escolhe a empresa; cada card leva pra
 *    EmpresaApontamentosPage (/empresas/:id/apontamentos), onde cria, edita
 *    e exclui. Apontamento sempre pertence a uma empresa.
 *  - EMPRESA: vê direto as observações compartilhadas com ela, só leitura
 *    (a API já devolve só os de visibilidade EMPRESA da própria empresa).
 */
export function ApontamentosListPage() {
  const { user } = useAuth();
  const isEmpresa = user?.tipo_usuario === "EMPRESA";

  // GET /empresas é só CONSULTOR — a EMPRESA levaria 403.
  const { data: empresas, isLoading, isError, error } = useEmpresasQuery({ enabled: !isEmpresa });
  const [search, setSearch] = useState("");

  if (isEmpresa) {
    return (
      <AppLayout>
        <h1 className="font-display text-2xl text-ink-900">Observações do consultor</h1>
        <p className="mt-1 text-sm text-ink-600">Apontamentos que o seu consultor compartilhou com a sua empresa.</p>
        <div className="mt-6">
          {user?.empresa_id ? (
            <ApontamentosPanel
              empresaId={user.empresa_id}
              title="Linha do tempo"
              canManage={false}
              emptyMessage="Seu consultor ainda não compartilhou observações."
            />
          ) : (
            <ErrorMessage>Não foi possível identificar a empresa deste usuário.</ErrorMessage>
          )}
        </div>
      </AppLayout>
    );
  }

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
      <h1 className="font-display text-2xl text-ink-900">Apontamentos</h1>
      <p className="mt-1 text-sm text-ink-600">Escolha uma empresa para ver e registrar observações sobre ela.</p>

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
              <Link key={empresa.id} to={empresaApontamentosPath(empresa.id)}>
                <Card className="flex items-center justify-between gap-3 p-5 transition-colors hover:border-ink-900/20 hover:bg-ink-900/[0.02]">
                  <div className="flex items-center gap-3">
                    <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-gold-100 text-gold-600">
                      <NotebookPen size={18} />
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
