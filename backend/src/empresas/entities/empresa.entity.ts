import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Empresa {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  nome!: string;

  // Personalidade, regras e dados da empresa: é o "system prompt" do bot
  @Column('text')
  promptSistema!: string;

  @Column({ default: true })
  ativo!: boolean;
}
