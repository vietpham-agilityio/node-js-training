import { Module } from '@nestjs/common';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { JwtModule } from '@nestjs/jwt';

// ORM
import { TypeOrmModule } from '@nestjs/typeorm';

// Libs
import {
  AppLoggerModule,
  AppCacheModule,
  ResponseLoggingInterceptor,
  HttpErrorFilter,
  decodeBase64Key,
} from '@app/common';

// Module
import { ProductController } from './product.controller';
import { ProductService } from './product.service';
import { ProductEntity } from './product.entity';

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
