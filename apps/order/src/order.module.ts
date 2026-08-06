import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { JwtModule } from '@nestjs/jwt';

// ORM
import { TypeOrmModule } from '@nestjs/typeorm';

// Libs
import { decodeBase64Key, AppLoggerModule } from '@app/common';

// Module
import { OrderController } from './order.controller';
import { OrderService } from './order.service';
import { Order } from './order.entity';

@Module({
  imports: [
    AppLoggerModule,
    TypeOrmModule.forRoot({
      type: 'better-sqlite3',
      database:
        process.env.NODE_ENV === 'test' ? ':memory:' : './database/order-db.sqlite',
      entities: [Order],
      synchronize: true,
    }),
    TypeOrmModule.forFeature([Order]),
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
    JwtModule.registerAsync({
      global: true,
      useFactory: () => ({
        publicKey: decodeBase64Key(process.env.JWT_PUBLIC_KEY_BASE64),
        verifyOptions: { algorithms: ['RS256'] },
      }),
    }),
  ],
  controllers: [OrderController],
  providers: [OrderService],
})
export class OrderModule {}
