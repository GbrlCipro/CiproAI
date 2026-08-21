import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Cliente {
  @PrimaryGeneratedColumn('uuid') // Usaremos UUID para IDs mais robustos
  id!: string;

  @Column()
  nome!: string;

  @Column()
  telefone!: string;

  @Column({ default: 'novo' })
  status?: string;
}