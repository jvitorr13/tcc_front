export interface Area {
  id: string;
  modelo_id: string;
  nome: string;
  ordem: number;
}

export interface CreateAreaInput {
  modelo_id: string;
  nome: string;
  ordem: number;
}
