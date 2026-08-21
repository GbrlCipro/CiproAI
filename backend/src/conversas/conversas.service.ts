import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Conversa } from './entities/conversa.entity';
import { CreateConversaDto } from './dto/create-conversa.dto';
import { ClientsService } from '../clientes/clients.service';
import { GeminiService } from '../ia/gemini.service';
import { GroqService } from '../ia/groq.service';

@Injectable()
export class ConversasService {
  constructor(
    @InjectRepository(Conversa)
    private readonly conversaRepository: Repository<Conversa>,
    private readonly clientsService: ClientsService,
    private readonly geminiService: GeminiService,
    private readonly groqService: GroqService,
  ) { }

  async processarMensagem(createConversaDto: CreateConversaDto): Promise<{ respostaIa: string }> {
    let clienteId = createConversaDto.clienteId;

    // Se vier '1' ou um ID genérico, tentamos buscar ou criamos um cliente padrão para testes
    try {
      await this.clientsService.findOne(clienteId);
    } catch (e) {
      // Se o cliente não existir, criamos um automaticamente para evitar o 404
      const novoCliente = await this.clientsService.create({
        nome: 'Cliente Teste',
        telefone: '11999999999',
        status: 'novo'
      });
      createConversaDto.clienteId = novoCliente.id;
    }

    // Salva mensagem do cliente
    const mensagemCliente = this.conversaRepository.create(createConversaDto);
    await this.conversaRepository.save(mensagemCliente);

    // Restante do código...
    const historico = await this.conversaRepository.find({
      where: { clienteId: createConversaDto.clienteId },
      order: { dataEnvio: 'ASC' }
    });

    const mensagensFormatadas = [
      { role: 'system' as const, content: 'Você é um assistente da CiproAI.' },
      ...historico.map((c) => ({
        role: (c.remetente === 'cliente' ? 'user' : 'assistant') as 'user' | 'assistant',
        content: c.mensagem,
      })),
    ];

    const respostaTexto = await this.groqService.gerarResposta(
      mensagensFormatadas,
    );

    const mensagemIa = this.conversaRepository.create({
      clienteId: createConversaDto.clienteId,
      remetente: 'ia',
      mensagem: respostaTexto,
    });
    await this.conversaRepository.save(mensagemIa);

    return { respostaIa: respostaTexto };
  }

  async findByCliente(clienteId: string): Promise<Conversa[]> {
    return await this.conversaRepository.find({
      where: { clienteId },
      order: { dataEnvio: 'ASC' }
    });
  }
}