import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

import type { Modelo } from "@/features/questionario/types/modelo.types";

export interface ModelosTableProps {
  modelos: Modelo[];
  onAtivar: (modelo: Modelo) => void;
  isAtivando: (id: string) => boolean;
}

/**
 * Sem GET de áreas/perguntas no back-end, não há como reabrir um modelo
 * pra edição — a única ação disponível numa linha é ativar (se ainda
 * estiver em rascunho). Ver modelos.service.ts.
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
          {modelos.map((modelo) => (
            <tr key={modelo.id}>
              <td className="py-3 pr-4 font-medium text-ink-900">{modelo.nome}</td>
              <td className="py-3 pr-4 text-ink-600">v{modelo.versao}</td>
              <td className="py-3 pr-4">
                <Badge variant={modelo.ativo ? "success" : "neutral"}>{modelo.ativo ? "Ativo" : "Rascunho"}</Badge>
              </td>
              <td className="py-3 pr-0 text-right">
                {!modelo.ativo && (
                  <Button size="sm" variant="secondary" isLoading={isAtivando(modelo.id)} onClick={() => onAtivar(modelo)}>
                    Ativar
                  </Button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
