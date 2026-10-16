import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Conversa } from './entities/conversa.entity';
import { CreateConversaDto } from './dto/create-conversa.dto';
import { ClientsService } from '../clientes/clients.service';
import { EmpresasService } from '../empresas/empresas.service';
import { GeminiService } from '../ia/gemini.service';
import { GroqService } from '../ia/groq.service';

// Quantas mensagens anteriores vão para a IA (controla custo e latência)
const HISTORICO_MAXIMO = 20;
// Quantas mensagens o chat mostra ao reabrir a conversa
const HISTORICO_EXIBIDO = 50;

@Injectable()
export class ConversasService {
  private readonly logger = new Logger(ConversasService.name);

  constructor(
    @InjectRepository(Conversa)
    private readonly conversaRepository: Repository<Conversa>,
    private readonly clientsService: ClientsService,
    private readonly empresasService: EmpresasService,
    private readonly geminiService: GeminiService,
    private readonly groqService: GroqService,
  ) { }

  async processarMensagem(dto: CreateConversaDto): Promise<{ respostaIa: string }> {
    // Lança 404 se o cliente não existir
    const cliente = await this.clientsService.findOne(dto.clienteId);

    // Prompt da empresa deste cliente (403 se a empresa estiver inativa)
    const promptSistema = await this.empresasService.obterPromptSistema(cliente.empresaId);

    // Só as últimas mensagens, ainda sem a mensagem nova
    const recentes = await this.conversaRepository.find({
      where: { clienteId: dto.clienteId },
      order: { dataEnvio: 'DESC' },
      take: HISTORICO_MAXIMO,
    });
    const historico = recentes.reverse();

    // O recorte pode começar numa resposta da IA: o histórico sempre começa numa mensagem do cliente
    while (historico.length > 0 && historico[0].remetente !== 'cliente') {
      historico.shift();
    }

    const mensagensFormatadas = [
      { role: 'system' as const, content: promptSistema },
      ...historico.map((c) => ({
        role: (c.remetente === 'cliente' ? 'user' : 'assistant') as 'user' | 'assistant',
        content: c.mensagem,
      })),
      { role: 'user' as const, content: dto.mensagem },
    ];

    const dataCliente = new Date(); // guardada antes de chamar a IA

    let respostaTexto: string;
    try {
      respostaTexto = await this.groqService.gerarResposta(mensagensFormatadas);
    } catch (error: any) {
      this.logger.error(`Falha ao gerar resposta da IA: ${error?.message || error}`);
      return {
        respostaIa: 'Desculpe, estou com um problema técnico no momento. Tente novamente em instantes.',
      };
    }

    // Só salva depois que a IA respondeu, então o histórico nunca fica com mensagem sem resposta
    await this.conversaRepository.save([
      this.conversaRepository.create({
        clienteId: dto.clienteId,
        remetente: 'cliente', // fixo no servidor
        mensagem: dto.mensagem,
        dataEnvio: dataCliente,
      }),
      this.conversaRepository.create({
        clienteId: dto.clienteId,
        remetente: 'ia',
        mensagem: respostaTexto,
        dataEnvio: new Date(),
      }),
    ]);

    return { respostaIa: respostaTexto };
  }

  // Usado pelo chat ao reabrir: só campos mínimos, ordem cronológica
  async historicoPublico(clienteId: string) {
    await this.clientsService.findOne(clienteId); // 404 se não existir

    const mensagens = await this.conversaRepository.find({
      where: { clienteId },
      order: { dataEnvio: 'DESC' },
      take: HISTORICO_EXIBIDO,
    });

    return mensagens.reverse().map((m) => ({
      remetente: m.remetente,
      mensagem: m.mensagem,
      dataEnvio: m.dataEnvio,
    }));
  }

  // Uso administrativo: conversa completa
  async findByCliente(clienteId: string): Promise<Conversa[]> {
    return await this.conversaRepository.find({
      where: { clienteId },
      order: { dataEnvio: 'ASC' },
    });
  }
}
