import { Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';
import { HttpModule } from '@nestjs/axios';
import { JwtModule } from '@nestjs/jwt';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';

// Libs
import {
  ResponseLoggingInterceptor,
  HttpErrorFilter,
  AppLoggerModule,
  decodeBase64Key,
} from '@app/common';

// Module
import {
  ProxyController,
  HealthController,
  InventoryProxyController,
  ProductProxyController,
  UserProxyController,
  AuthProxyController,
} from './controller';
import {
  OrderProxyService,
  ProductProxyService,
  UserProxyService,
} from './services';

@Module({
  imports: [
    AppLoggerModule,
    TerminusModule,
    HttpModule,
    JwtModule.registerAsync({
      global: true,
      useFactory: () => ({
        publicKey: decodeBase64Key(process.env.JWT_PUBLIC_KEY_BASE64),
        verifyOptions: { algorithms: ['RS256'] },
      }),
    }),
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
export class AppModule {}
