import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseUUIDPipe,
  UseGuards,
} from '@nestjs/common';
import { ClientsService } from './clients.service';
import { CreateClienteDto } from './dto/create-cliente.dto';
import { UpdateClienteDto } from './dto/update-cliente.dto';
import { AdminGuard } from '../common/admin.guard';

@Controller('clientes')
export class ClientsController {
  constructor(private readonly clientsService: ClientsService) {}

  // Pública: o chat usa para registrar o visitante
  @Post()
  create(@Body() createClienteDto: CreateClienteDto) {
    return this.clientsService.create(createClienteDto);
  }

  @UseGuards(AdminGuard)
  @Get()
  findAll() {
    return this.clientsService.findAll();
  }

  @UseGuards(AdminGuard)
  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.clientsService.findOne(id);
  }

  @UseGuards(AdminGuard)
  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateClienteDto: UpdateClienteDto,
  ) {
    return this.clientsService.update(id, updateClienteDto);
  }

  @UseGuards(AdminGuard)
  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.clientsService.remove(id);
  }
}
