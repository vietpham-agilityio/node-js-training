import { Module } from '@nestjs/common';
import { InventoryController } from './inventory.controller';
import { InventoryService } from './inventory.service';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InventoryItem } from './inventory-item.entity';
import { AppLoggerModule } from '@app/common';

@Module({
  imports: [
    AppLoggerModule,
    TypeOrmModule.forRoot({
      type: 'better-sqlite3',
      database:
        process.env.NODE_ENV === 'test'
          ? ':memory:'
          : './database/inventory-db.sqlite',
      entities: [InventoryItem],
      synchronize: true,
    }),
    TypeOrmModule.forFeature([InventoryItem]),
    ClientsModule.register([
      {
        name: 'ORDER_SERVICE',
        transport: Transport.TCP,
        options: {
          host: process.env.ORDER_SERVICE_HOST,
          port: 8001,
          retryAttempts: 3,
          retryDelay: 3000,
        },
      },
    ]),
  ],
  controllers: [InventoryController],
  providers: [InventoryService],
})
export class InventoryModule { }
