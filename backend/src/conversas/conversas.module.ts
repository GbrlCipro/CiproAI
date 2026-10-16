import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConversasService } from './conversas.service';
import { ConversasController } from './conversas.controller';
import { Conversa } from './entities/conversa.entity'; // Importe a entidade
import { ClientsModule } from '../clientes/clients.module';
import { EmpresasModule } from '../empresas/empresas.module';
import { IaModule } from '../ia/ia.module';

@Module({
  imports: [TypeOrmModule.forFeature([Conversa]), ClientsModule, EmpresasModule, IaModule],
  controllers: [ConversasController],
  providers: [ConversasService],
})
export class ConversasModule {}
