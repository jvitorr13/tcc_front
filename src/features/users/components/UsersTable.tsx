import { Pencil, Trash2 } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";

import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { usuarioEditarPath } from "@/constants/routes";

import type { AuthUser, TipoUsuario } from "@/features/auth";

export interface UsersTableProps {
  users: AuthUser[];
  /** Nome de exibição da empresa por id — só relevante para usuários "EMPRESA". */
  empresaNameById: Map<string, string>;
  onDelete: (user: AuthUser) => void;
  isDeleting: (id: string) => boolean;
}

const TIPO_USUARIO_LABELS: Record<TipoUsuario, string> = {
  CONSULTOR: "Consultor",
  EMPRESA: "Empresa",
};

/**
 * Cada linha tem seu próprio estado de "confirmando exclusão" (em vez de um
 * modal): clicar em excluir troca as ações por Confirmar/Cancelar na mesma
 * linha. Simples o bastante para não precisar de um componente de dialog só
 * para isso.
 */
export function UsersTable({ users, empresaNameById, onDelete, isDeleting }: UsersTableProps) {
  const [confirmingId, setConfirmingId] = useState<string | null>(null);

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-ink-900/8 text-xs uppercase tracking-wide text-ink-500">
            <th className="py-3 pr-4 font-medium">Nome</th>
            <th className="py-3 pr-4 font-medium">E-mail</th>
            <th className="py-3 pr-4 font-medium">Tipo de usuário</th>
            <th className="py-3 pr-4 font-medium">Empresa</th>
            <th className="py-3 pr-4 font-medium">Status</th>
            <th className="py-3 pr-0 text-right font-medium">Ações</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-ink-900/6">
          {users.map((user) => (
            <tr key={user.id}>
              <td className="py-3 pr-4 font-medium text-ink-900">{user.nome}</td>
              <td className="py-3 pr-4 text-ink-600">{user.email}</td>
              <td className="py-3 pr-4">
                <Badge variant="neutral">{TIPO_USUARIO_LABELS[user.tipo_usuario]}</Badge>
              </td>
              <td className="py-3 pr-4 text-ink-600">
                {user.tipo_usuario === "EMPRESA" ? (empresaNameById.get(user.empresa_id ?? "") ?? "—") : "—"}
              </td>
              <td className="py-3 pr-4">
                <Badge variant={user.ativo ? "success" : "danger"}>{user.ativo ? "Ativo" : "Inativo"}</Badge>
              </td>
              <td className="py-3 pr-0">
                <div className="flex items-center justify-end gap-2">
                  {confirmingId === user.id ? (
                    <>
                      <span className="text-xs text-ink-600">Excluir usuário?</span>
                      <Button
                        size="sm"
                        variant="danger"
                        isLoading={isDeleting(user.id)}
                        onClick={() => onDelete(user)}
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
                        to={usuarioEditarPath(user.id)}
                        className="flex size-8 items-center justify-center rounded-lg text-ink-600 transition-colors hover:bg-ink-900/5 hover:text-ink-900"
                        aria-label={`Editar ${user.nome}`}
                        title="Editar"
                      >
                        <Pencil size={15} />
                      </Link>
                      <button
                        type="button"
                        onClick={() => setConfirmingId(user.id)}
                        className="flex size-8 items-center justify-center rounded-lg text-ink-600 transition-colors hover:bg-danger-50 hover:text-danger-600"
                        aria-label={`Excluir ${user.nome}`}
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
