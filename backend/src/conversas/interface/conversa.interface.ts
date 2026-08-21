export interface Conversa {
  id: string;
  clienteId: string; // Guarda o ID do cliente dono da conversa
  remetente: 'cliente' | 'ia' | 'humano'; // Quem mandou a mensagem
  mensagem: string; // O texto em si
  dataEnvio: Date; // Momento exato que ocorreu
}