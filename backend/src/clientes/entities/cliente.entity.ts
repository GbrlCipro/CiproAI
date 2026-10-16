import { Entity, Column, PrimaryGeneratedColumn, Index } from 'typeorm';

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

  // Empresa a que este cliente pertence (define qual prompt o bot usa)
  @Index()
  @Column({ type: 'varchar', nullable: true })
  empresaId?: string | null;
}
