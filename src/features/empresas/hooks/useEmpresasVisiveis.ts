import { useAuth } from "@/hooks/useAuth";

import { useEmpresaQuery } from "@/features/empresas/hooks/useEmpresaQuery";
import { useEmpresasQuery } from "@/features/empresas/hooks/useEmpresasQuery";
import type { Empresa } from "@/features/empresas/types/empresa.types";

/**
 * Empresas que o usuário logado pode ver, já pelo caminho certo da API:
 *  - CONSULTOR: GET /empresas (todas as ativas);
 *  - EMPRESA: GET /empresas/{id} da própria — GET /empresas é só CONSULTOR
 *    e responderia 403 (era isso que deixava o nome como "—").
 * `empresaIds` da EMPRESA vem do próprio usuário, então as telas que
 * buscam "por empresa" funcionam mesmo se o nome ainda não carregou.
 */
export function useEmpresasVisiveis() {
  const { user } = useAuth();
  const isEmpresa = user?.tipo_usuario === "EMPRESA";
  const empresaPropriaId = isEmpresa ? user?.empresa_id : undefined;

  const lista = useEmpresasQuery({ enabled: !isEmpresa });
  const propria = useEmpresaQuery(empresaPropriaId);

  if (isEmpresa) {
    const empresas: Empresa[] = propria.data ? [propria.data] : [];
    return {
      empresas,
      empresaIds: empresaPropriaId ? [empresaPropriaId] : [],
      isLoading: propria.isLoading,
    };
  }

  const empresas = lista.data ?? [];
  return {
    empresas,
    empresaIds: empresas.map((empresa) => empresa.id),
    isLoading: lista.isLoading,
  };
}
