import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Empresa } from './entities/empresa.entity';
import { CreateEmpresaDto } from './dto/create-empresa.dto';
import { UpdateEmpresaDto } from './dto/update-empresa.dto';

export const PROMPT_PADRAO =
  'Você é um assistente virtual. Responda sempre em português do Brasil, de forma educada e objetiva.';

@Injectable()
export class EmpresasService {
  constructor(
    @InjectRepository(Empresa)
    private readonly empresaRepository: Repository<Empresa>,
  ) {}

  async create(dto: CreateEmpresaDto): Promise<Empresa> {
    const empresa = this.empresaRepository.create(dto);
    return await this.empresaRepository.save(empresa);
  }

  async findAll(): Promise<Empresa[]> {
    return await this.empresaRepository.find();
  }

  async findOne(id: string): Promise<Empresa> {
    const empresa = await this.empresaRepository.findOneBy({ id });
    if (!empresa) {
      throw new NotFoundException(`Empresa com ID ${id} não encontrada.`);
    }
    return empresa;
  }

  async update(id: string, dto: UpdateEmpresaDto): Promise<Empresa> {
    await this.findOne(id);
    await this.empresaRepository.update(id, dto);
    return await this.findOne(id);
  }

  /**
   * Devolve o prompt de sistema da empresa.
   * - Sem empresa vinculada: usa o prompt padrão.
   * - Empresa inativa: bloqueia o atendimento (403).
   */
  async obterPromptSistema(empresaId?: string | null): Promise<string> {
    if (!empresaId) return PROMPT_PADRAO;

    const empresa = await this.empresaRepository.findOneBy({ id: empresaId });
    if (!empresa) return PROMPT_PADRAO;

    if (!empresa.ativo) {
      throw new ForbiddenException('Atendimento indisponível para esta empresa.');
    }

    return empresa.promptSistema;
  }
}
