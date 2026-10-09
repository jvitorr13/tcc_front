import { httpService } from "@/services/http.service";

import type { CreateEmpresaInput, Empresa, UpdateEmpresaInput } from "@/features/empresas/types/empresa.types";

/**
 * Contrato de API (internal/empresa), sempre autenticado:
 *
 *   GET    /empresas?page=&page_size=&ativo=  -> Empresa[] (paginado, meta com ApiPagination; por padrão
 *                                               só ativas — ativo=false traz também as inativas)
 *   GET    /empresas/:id                -> Empresa
 *   POST   /empresas                     { razao_social, nome_fantasia, cnpj, email, telefone, endereco, ativo } -> Empresa
 *   PUT    /empresas/:id                 (todos os campos opcionais) -> Empresa
 *   DELETE /empresas/:id                 -> 204
 *
 * `list` busca uma página grande (page_size alto) em vez de paginar de
 * verdade — hoje não há UI de paginação nem para a tela de Empresas nem
 * para o seletor de "empresa vinculada" no cadastro de usuário; a busca por
 * nome/CNPJ na tela de Empresas filtra client-side sobre essa lista.
 */
const EMPRESAS_PATH = "/empresas";

export const empresasService = {
  async list(incluirInativas = false): Promise<Empresa[]> {
    const { items } = await httpService.list<Empresa>(EMPRESAS_PATH, {
      page: 1,
      page_size: 100,
      ...(incluirInativas && { ativo: false }),
    });
    return items;
  },

  getById: (id: string) => httpService.getById<Empresa>(EMPRESAS_PATH, id),

  create: (input: CreateEmpresaInput) => httpService.create<Empresa, CreateEmpresaInput>(EMPRESAS_PATH, input),

  update: (id: string, input: UpdateEmpresaInput) =>
    httpService.update<Empresa, UpdateEmpresaInput>(EMPRESAS_PATH, id, input),

  remove: (id: string) => httpService.remove(EMPRESAS_PATH, id),
};
