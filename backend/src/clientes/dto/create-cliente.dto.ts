import { IsString, IsNotEmpty, IsOptional, IsIn, IsUUID } from 'class-validator';

export class CreateClienteDto {
  @IsString()
  @IsNotEmpty()
  nome!: string;

  @IsString()
  @IsNotEmpty()
  telefone!: string;

  @IsUUID()
  empresaId!: string;

  @IsOptional()
  @IsIn(['novo', 'em_atendimento', 'qualificado', 'convertido'])
  status?: 'novo' | 'em_atendimento' | 'qualificado' | 'convertido';
}
