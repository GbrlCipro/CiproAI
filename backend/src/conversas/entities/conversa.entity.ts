import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';

@Entity()
export class Conversa {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  clienteId: string;

  @Column()
  remetente: string;

  @Column('text')
  mensagem: string;

  @CreateDateColumn()
  dataEnvio: Date;
}