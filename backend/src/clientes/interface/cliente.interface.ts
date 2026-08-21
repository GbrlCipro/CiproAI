export interface Cliente {
  id: string;
  nome: string;
  telefone: string;
  status: 'novo' | 'em_atendimento' | 'qualificado' | 'convertido';
}