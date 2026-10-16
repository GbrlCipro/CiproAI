import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClientsService } from './clients.service';
import { ClientsController } from './clients.controller';
import { Cliente } from './entities/cliente.entity';
import { EmpresasModule } from '../empresas/empresas.module';

@Module({
  imports: [TypeOrmModule.forFeature([Cliente]), EmpresasModule],
  controllers: [ClientsController],
  providers: [ClientsService],
  exports: [ClientsService],
})
export class ClientsModule {}
