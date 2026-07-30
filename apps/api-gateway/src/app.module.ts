// Libs
import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';
import { HttpModule } from '@nestjs/axios';
import { JwtModule } from '@nestjs/jwt';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';

// Controller
import {
  ProxyController,
  HealthController,
  InventoryProxyController,
  ProductProxyController,
  UserProxyController,
  AuthProxyController,
} from './controller';

// Extensions
import {
  ResponseLoggingInterceptor,
  HttpErrorFilter,
  LoggingMiddleware,
  decodeBase64Key,
} from '@app/common';

// Services
import {
  InventoryProxyService,
  OrderProxyService,
  ProductProxyService,
  UserProxyService,
  AuthProxyService,
} from './services';


@Module({
  imports: [
    TerminusModule,
    HttpModule,
    JwtModule.registerAsync({
      global: true,
      useFactory: () => ({
        publicKey: decodeBase64Key(process.env.JWT_PUBLIC_KEY_BASE64),
        verifyOptions: { algorithms: ['RS256'] },
      }),
    }),
    ClientsModule.register([
      {
        name: 'INVENTORY_SERVICE',
        transport: Transport.TCP,
        options: {
          port: 8002,
        },
      },
      {
        name: 'AUTH_SERVICE',
        transport: Transport.TCP,
        options: {
          port: 8003,
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
    AuthProxyController,
  ],
  providers: [
    OrderProxyService,
    InventoryProxyService,
    UserProxyService,
    ProductProxyService,
    AuthProxyService,
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
