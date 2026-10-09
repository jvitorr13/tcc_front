import { CopyPlus } from "lucide-react";
import { Link } from "react-router-dom";

import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { modeloNovaVersaoPath } from "@/constants/routes";

import { getVersaoAtual, type Modelo } from "@/features/questionario/types/modelo.types";

export interface ModelosTableProps {
  modelos: Modelo[];
  /** O que se ativa é a VERSÃO (versaoId), não o modelo — ver versoes.service.ts. */
  onAtivar: (modelo: Modelo, versaoId: string) => void;
  isAtivando: (versaoId: string) => boolean;
}

/**
 * Ações por linha: "Nova versão" (versão salva nunca muda — editar é criar
 * uma versão nova a partir da mais recente) e "Ativar" (se a mais recente
 * ainda estiver em rascunho). Ver modelos.service.ts.
 */
export function ModelosTable({ modelos, onAtivar, isAtivando }: ModelosTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-ink-900/8 text-xs uppercase tracking-wide text-ink-500">
            <th className="py-3 pr-4 font-medium">Nome</th>
            <th className="py-3 pr-4 font-medium">Versão</th>
            <th className="py-3 pr-4 font-medium">Status</th>
            <th className="py-3 pr-0 text-right font-medium">Ações</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-ink-900/6">
          {modelos.map((modelo) => {
            const versaoAtual = getVersaoAtual(modelo);
            const ativo = versaoAtual?.ativo ?? false;
            return (
              <tr key={modelo.id}>
                <td className="py-3 pr-4 font-medium text-ink-900">{modelo.nome}</td>
                <td className="py-3 pr-4 text-ink-600">v{versaoAtual?.numero_versao ?? "—"}</td>
                <td className="py-3 pr-4">
                  <Badge variant={ativo ? "success" : "neutral"}>{ativo ? "Ativo" : "Rascunho"}</Badge>
                </td>
                <td className="py-3 pr-0 text-right">
                  <div className="flex items-center justify-end gap-2">
                    {versaoAtual && (
                      <Link
                        to={modeloNovaVersaoPath(modelo.id, versaoAtual.id)}
                        className="inline-flex h-9 items-center justify-center gap-1.5 rounded-lg px-3 text-sm font-medium text-ink-700 transition-colors hover:bg-ink-900/5"
                      >
                        <CopyPlus size={14} />
                        Nova versão
                      </Link>
                    )}
                    {!ativo && versaoAtual && (
                      <Button
                        size="sm"
                        variant="secondary"
                        isLoading={isAtivando(versaoAtual.id)}
                        onClick={() => onAtivar(modelo, versaoAtual.id)}
                      >
                        Ativar
                      </Button>
                    )}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
