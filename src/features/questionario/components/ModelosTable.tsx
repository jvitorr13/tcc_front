import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

import { getVersaoAtual, type Modelo } from "@/features/questionario/types/modelo.types";

export interface ModelosTableProps {
  modelos: Modelo[];
  /** O que se ativa é a VERSÃO (versaoId), não o modelo — ver versoes.service.ts. */
  onAtivar: (modelo: Modelo, versaoId: string) => void;
  isAtivando: (versaoId: string) => boolean;
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
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
