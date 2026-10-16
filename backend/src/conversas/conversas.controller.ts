import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  ParseUUIDPipe,
  UseGuards,
} from '@nestjs/common';
import { ConversasService } from './conversas.service';
import { CreateConversaDto } from './dto/create-conversa.dto';
import { AdminGuard } from '../common/admin.guard';

@Controller('conversas')
export class ConversasController {
  constructor(private readonly conversasService: ConversasService) { }

  // Pública: usada pelo chat para enviar mensagens
  @Post()
  async create(@Body() createConversaDto: CreateConversaDto) {
    return await this.conversasService.processarMensagem(createConversaDto);
  }

  // Pública: o chat usa para reabrir a conversa. Devolve só remetente, mensagem e data
  // das últimas mensagens. O UUID do cliente funciona como "senha" da sessão.
  @Get('historico/:clienteId')
  historico(@Param('clienteId', ParseUUIDPipe) clienteId: string) {
    return this.conversasService.historicoPublico(clienteId);
  }

  // Admin: conversa completa de um cliente
  @UseGuards(AdminGuard)
  @Get('cliente/:clienteId')
  findByCliente(@Param('clienteId', ParseUUIDPipe) clienteId: string) {
    return this.conversasService.findByCliente(clienteId);
  }
}
