// Libs
import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';
import { HttpModule } from '@nestjs/axios';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';

// Controller
import {
  ProxyController,
  HealthController,
  InventoryProxyController,
  ProductProxyController,
  UserProxyController
} from './controller';

// Extensions
import {
  ResponseLoggingInterceptor,
  HttpErrorFilter,
  LoggingMiddleware,
} from '@app/common';

// Services
import {
  InventoryProxyService,
  OrderProxyService,
  ProductProxyService,
  UserProxyService,
} from './services';


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
