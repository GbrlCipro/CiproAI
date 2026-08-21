import { IsString, IsNotEmpty, IsIn } from 'class-validator';

export class CreateConversaDto {
  @IsString()
  @IsNotEmpty()
  clienteId!: string;

  @IsString()
  @IsIn(['cliente', 'ia', 'humano'])
  remetente!: 'cliente' | 'ia' | 'humano';

  @IsString()
  @IsNotEmpty()
  mensagem!: string;
}