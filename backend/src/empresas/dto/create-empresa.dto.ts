import { IsString, IsNotEmpty, IsOptional, IsBoolean, MaxLength } from 'class-validator';

export class CreateEmpresaDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  nome!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(8000)
  promptSistema!: string;

  @IsOptional()
  @IsBoolean()
  ativo?: boolean;
}
