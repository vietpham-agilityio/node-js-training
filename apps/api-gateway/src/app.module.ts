import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';
import { HttpModule } from '@nestjs/axios';
import { ProxyController } from './proxy.controller';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import {
  ResponseLoggingInterceptor,
  HttpErrorFilter,
  LoggingMiddleware,
} from '@app/common';
import { ConsulService } from './consul.service';

@Module({
  imports: [TerminusModule, HttpModule],
  controllers: [ProxyController],
  providers: [
    ConsulService,
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
