import { IsString, IsNotEmpty, IsOptional, IsIn } from 'class-validator';

export class CreateClienteDto {
  @IsString()
  @IsNotEmpty()
  nome!: string;

  @IsString()
  @IsNotEmpty()
  telefone!: string;

  @IsOptional()
  @IsIn(['novo', 'em_atendimento', 'qualificado', 'convertido'])
  status?: 'novo' | 'em_atendimento' | 'qualificado' | 'convertido';
}