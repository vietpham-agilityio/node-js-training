import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';
import { HttpModule } from '@nestjs/axios';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ProxyController } from './order-proxy.controller';
import { HealthController } from './health.controller';
import { InventoryProxyController } from './inventory-proxy.controller';
import { UserProxyController } from './user-proxy.controller';
import { ProductProxyController } from './product-proxy.controller';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import {
  ResponseLoggingInterceptor,
  HttpErrorFilter,
  LoggingMiddleware,
} from '@app/common';
import { OrderProxyService } from './order-proxy.service';
import { InventoryProxyService } from './inventory-proxy.service';
import { UserProxyService } from './user-proxy.service';
import { ProductProxyService } from './product-proxy.service';

@Module({
  imports: [
    TerminusModule,
    HttpModule,
    ClientsModule.register([
      {
        name: 'INVENTORY_SERVICE',
        transport: Transport.TCP,
        options: {
          port: 8002,
        },
      },
    ]),
  ],
  controllers: [
    ProxyController,
    HealthController,
    InventoryProxyController,
    UserProxyController,
    ProductProxyController,
  ],
  providers: [
    OrderProxyService,
    InventoryProxyService,
    UserProxyService,
    ProductProxyService,
    {
      provide: APP_INTERCEPTOR,
      useClass: ResponseLoggingInterceptor,
    },
    {
      provide: APP_FILTER,
      useClass: HttpErrorFilter,
    },
  ],
})

export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggingMiddleware).forRoutes('*');
  }
}
