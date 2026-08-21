import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { ConversasService } from './conversas.service';
import { CreateConversaDto } from './dto/create-conversa.dto';

@Controller('conversas')
export class ConversasController {
  constructor(private readonly conversasService: ConversasService) { }

@Post()
  async create(@Body() createConversaDto: CreateConversaDto) {
    //console.log('BODY RECEBIDO:', createConversaDto);
    return await this.conversasService.processarMensagem(createConversaDto);
  }

  @Get('cliente/:clienteId')
  findByCliente(@Param('clienteId') clienteId: string) {
    return this.conversasService.findByCliente(clienteId);
  }
}