import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';

// Module
import { AuthProxyService } from '../services';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'AUTH_SERVICE',
        transport: Transport.TCP,
        options: {
          host: process.env.AUTH_SERVICE_HOST,
          port: 8003,
        },
      },
    ]),
  ],
  providers: [AuthProxyService],
  exports: [AuthProxyService],
})
export class AuthProxyModule {}
