import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClientsModule } from './clientes/clients.module';
import { ConversasModule } from './conversas/conversas.module';
import { EmpresasModule } from './empresas/empresas.module';
import { IaModule } from './ia/ia.module';


@Module({
    imports: [
        ConfigModule.forRoot({ isGlobal: true }),
        TypeOrmModule.forRoot({
            type: 'better-sqlite3',
            database: 'ciproai.sqlite', // O arquivo do banco será criado automaticamente na raiz
            entities: [__dirname + '/**/*.entity{.ts,.js}'],
            synchronize: true, // Em produção, mude para false! Isso cria as tabelas automaticamente
        }),
        EmpresasModule,
        ClientsModule,
        ConversasModule,
        IaModule,
    ]
})

export class AppModule { }
