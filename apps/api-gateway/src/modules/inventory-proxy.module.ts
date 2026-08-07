import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';

// Module
import { InventoryProxyService } from '../services';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'INVENTORY_SERVICE',
        transport: Transport.TCP,
        options: {
          host: process.env.INVENTORY_SERVICE_HOST,
          port: 8002,
        },
      },
    ]),
  ],
  providers: [InventoryProxyService],
  exports: [InventoryProxyService],
})
export class InventoryProxyModule {}
