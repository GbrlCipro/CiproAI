import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cliente } from './entities/cliente.entity';
import { CreateClienteDto } from './dto/create-cliente.dto';
import { UpdateClienteDto } from './dto/update-cliente.dto';
import { EmpresasService } from '../empresas/empresas.service';

@Injectable()
export class ClientsService {
  constructor(
    @InjectRepository(Cliente)
    private readonly clienteRepository: Repository<Cliente>,
    private readonly empresasService: EmpresasService,
  ) {}

  async create(createClienteDto: CreateClienteDto): Promise<Cliente> {
    await this.validarEmpresa(createClienteDto.empresaId);
    const cliente = this.clienteRepository.create(createClienteDto);
    return await this.clienteRepository.save(cliente);
  }

  async findAll(): Promise<Cliente[]> {
    return await this.clienteRepository.find();
  }

  async findOne(id: string): Promise<Cliente> {
    const cliente = await this.clienteRepository.findOneBy({ id });
    if (!cliente) {
      throw new NotFoundException(`Cliente com ID ${id} não encontrado.`);
    }
    return cliente;
  }

  async update(id: string, updateClienteDto: UpdateClienteDto): Promise<Cliente> {
    await this.findOne(id); // Garante que existe, senão lança 404
    if (updateClienteDto.empresaId) {
      await this.validarEmpresa(updateClienteDto.empresaId);
    }
    await this.clienteRepository.update(id, updateClienteDto);
    return await this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    const cliente = await this.findOne(id); // Garante que existe
    await this.clienteRepository.remove(cliente);
  }

  // Empresa precisa existir (404 se não) e estar ativa
  private async validarEmpresa(empresaId: string): Promise<void> {
    const empresa = await this.empresasService.findOne(empresaId);
    if (!empresa.ativo) {
      throw new BadRequestException('Esta empresa está inativa.');
    }
  }
}
