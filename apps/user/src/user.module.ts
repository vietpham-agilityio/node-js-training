import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { UserController } from './users.controller';
import { UserService } from './users.service';
import { UserEntity } from './user.entity';
import {
  AppLoggerModule,
  ResponseLoggingInterceptor,
  HttpErrorFilter,
  decodeBase64Key,
} from '@app/common';

@Module({
  imports: [
    AppLoggerModule,
    TypeOrmModule.forRoot({
      type: 'better-sqlite3',
      database:
        process.env.NODE_ENV === 'test' ? ':memory:' : './database/user-db.sqlite',
      entities: [UserEntity],
      synchronize: true,
    }),
    TypeOrmModule.forFeature([UserEntity]),
    JwtModule.registerAsync({
      global: true,
      useFactory: () => ({
        publicKey: decodeBase64Key(process.env.JWT_PUBLIC_KEY_BASE64),
        verifyOptions: { algorithms: ['RS256'] },
      }),
    }),
  ],
  controllers: [UserController],
  providers: [
    UserService,
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
export class UserModule {}
