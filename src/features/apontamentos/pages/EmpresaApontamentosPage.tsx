import { ArrowLeft } from "lucide-react";
import { useState } from "react";
import { Link, useParams } from "react-router-dom";

import { Label } from "@/components/ui/Label";
import { Select } from "@/components/ui/Select";
import { AppLayout } from "@/layouts/AppLayout";
import { ROUTES } from "@/constants/routes";

import { useEmpresaQuery } from "@/features/empresas";

import { ApontamentosPanel } from "@/features/apontamentos/components/ApontamentosPanel";
import { useVinculosDaEmpresa } from "@/features/apontamentos/hooks/useVinculosDaEmpresa";

/**
 * Apontamentos de uma empresa (só CONSULTOR — ver routes/modules.tsx). Não
 * existe página de detalhe da empresa com abas, então esta é uma página
 * própria, aberta pelo menu "Apontamentos" (escolha da empresa) ou pelo
 * ícone na lista de Empresas. Sempre dentro de uma empresa.
 *
 * O filtro (opcional) usa os parâmetros diagnostico_id/tarefa_id da API;
 * o valor do <select> é "d:<id>" ou "t:<id>".
 */
export function EmpresaApontamentosPage() {
  const { id: empresaId } = useParams<{ id: string }>();
  const { data: empresa } = useEmpresaQuery(empresaId);
  const { diagnosticos, tarefas } = useVinculosDaEmpresa(empresaId);
  const [filtro, setFiltro] = useState("");

  const filtroApi = filtro.startsWith("d:")
    ? { diagnostico_id: filtro.slice(2) }
    : filtro.startsWith("t:")
      ? { tarefa_id: filtro.slice(2) }
      : undefined;

  const nomeEmpresa = empresa ? empresa.nome_fantasia || empresa.razao_social : undefined;

  if (!empresaId) return null;

  return (
    <AppLayout>
      <Link
        to={ROUTES.apontamentos}
        className="inline-flex items-center gap-1.5 text-sm font-medium text-ink-600 transition-colors hover:text-ink-900"
      >
        <ArrowLeft size={15} />
        Apontamentos
      </Link>

      <div className="mt-2">
        <h1 className="font-display text-2xl text-ink-900">Apontamentos</h1>
        <p className="mt-1 text-sm text-ink-600">
          {nomeEmpresa ? `Observações registradas sobre ${nomeEmpresa}.` : "Observações registradas sobre a empresa."}
        </p>
      </div>

      <div className="mt-6">
        <ApontamentosPanel
          empresaId={empresaId}
          title="Linha do tempo"
          description="Do mais recente para o mais antigo. Os internos só os consultores veem."
          canManage
          filtro={filtroApi}
          emptyMessage={filtroApi ? "Nenhum apontamento com este vínculo." : "Nenhum apontamento registrado ainda."}
          toolbar={
            (diagnosticos.length > 0 || tarefas.length > 0) && (
              <div className="max-w-sm">
                <Label htmlFor="filtro-apontamentos">Mostrar</Label>
                <Select id="filtro-apontamentos" value={filtro} onChange={(event) => setFiltro(event.target.value)}>
                  <option value="">Todos os apontamentos</option>
                  {diagnosticos.length > 0 && (
                    <optgroup label="Diagnóstico">
                      {diagnosticos.map((item) => (
                        <option key={item.id} value={`d:${item.id}`}>
                          {item.label}
                        </option>
                      ))}
                    </optgroup>
                  )}
                  {tarefas.length > 0 && (
                    <optgroup label="Tarefa">
                      {tarefas.map((item) => (
                        <option key={item.id} value={`t:${item.id}`}>
                          {item.label}
                        </option>
                      ))}
                    </optgroup>
                  )}
                </Select>
              </div>
            )
          }
        />
      </div>
    </AppLayout>
  );
}
