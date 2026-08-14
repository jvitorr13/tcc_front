import { Pencil, Trash2 } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";

import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { empresaEditarPath } from "@/constants/routes";

import type { Empresa } from "@/features/empresas/types/empresa.types";

export interface EmpresasTableProps {
  empresas: Empresa[];
  onDelete: (empresa: Empresa) => void;
  isDeleting: (id: string) => boolean;
}

/**
 * Mesmo padrão do UsersTable: exclusão confirmada em linha, sem modal.
 */
export function EmpresasTable({ empresas, onDelete, isDeleting }: EmpresasTableProps) {
  const [confirmingId, setConfirmingId] = useState<string | null>(null);

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-ink-900/8 text-xs uppercase tracking-wide text-ink-500">
            <th className="py-3 pr-4 font-medium">Empresa</th>
            <th className="py-3 pr-4 font-medium">CNPJ</th>
            <th className="py-3 pr-4 font-medium">E-mail</th>
            <th className="py-3 pr-4 font-medium">Status</th>
            <th className="py-3 pr-0 text-right font-medium">Ações</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-ink-900/6">
          {empresas.map((empresa) => (
            <tr key={empresa.id}>
              <td className="py-3 pr-4 font-medium text-ink-900">
                {empresa.nome_fantasia || empresa.razao_social}
              </td>
              <td className="py-3 pr-4 text-ink-600">{empresa.cnpj}</td>
              <td className="py-3 pr-4 text-ink-600">{empresa.email}</td>
              <td className="py-3 pr-4">
                <Badge variant={empresa.ativo ? "success" : "danger"}>{empresa.ativo ? "Ativa" : "Inativa"}</Badge>
              </td>
              <td className="py-3 pr-0">
                <div className="flex items-center justify-end gap-2">
                  {confirmingId === empresa.id ? (
                    <>
                      <span className="text-xs text-ink-600">Excluir empresa?</span>
                      <Button
                        size="sm"
                        variant="danger"
                        isLoading={isDeleting(empresa.id)}
                        onClick={() => onDelete(empresa)}
                      >
                        Confirmar
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => setConfirmingId(null)}>
                        Cancelar
                      </Button>
                    </>
                  ) : (
                    <>
                      <Link
                        to={empresaEditarPath(empresa.id)}
                        className="flex size-8 items-center justify-center rounded-lg text-ink-600 transition-colors hover:bg-ink-900/5 hover:text-ink-900"
                        aria-label={`Editar ${empresa.nome_fantasia || empresa.razao_social}`}
                        title="Editar"
                      >
                        <Pencil size={15} />
                      </Link>
                      <button
                        type="button"
                        onClick={() => setConfirmingId(empresa.id)}
                        className="flex size-8 items-center justify-center rounded-lg text-ink-600 transition-colors hover:bg-danger-50 hover:text-danger-600"
                        aria-label={`Excluir ${empresa.nome_fantasia || empresa.razao_social}`}
                        title="Excluir"
                      >
                        <Trash2 size={15} />
                      </button>
                    </>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
