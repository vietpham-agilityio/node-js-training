import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { ProductController } from './product.controller';
import { ProductService } from './product.service';
import { ProductEntity } from './product.entity';
import {
  AppLoggerModule,
  AppCacheModule,
  ResponseLoggingInterceptor,
  HttpErrorFilter,
  decodeBase64Key,
} from '@app/common';

@Module({
  imports: [
    AppLoggerModule,
    AppCacheModule,
    TypeOrmModule.forRoot({
      type: 'better-sqlite3',
      database:
        process.env.NODE_ENV === 'test'
          ? ':memory:'
          : './database/product-db.sqlite',
      entities: [ProductEntity],
      synchronize: true,
    }),
    TypeOrmModule.forFeature([ProductEntity]),
    JwtModule.registerAsync({
      global: true,
      useFactory: () => ({
        publicKey: decodeBase64Key(process.env.JWT_PUBLIC_KEY_BASE64),
        verifyOptions: { algorithms: ['RS256'] },
      }),
    }),
  ],
  controllers: [ProductController],
  providers: [
    ProductService,
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
export class ProductModule {}
