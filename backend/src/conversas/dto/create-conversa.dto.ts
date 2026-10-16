import { IsString, IsNotEmpty, IsUUID } from 'class-validator';

export class CreateConversaDto {
  @IsUUID()
  clienteId!: string;

  @IsString()
  @IsNotEmpty()
  mensagem!: string;
}