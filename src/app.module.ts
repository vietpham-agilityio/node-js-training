import { Module, ValidationPipe } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER, APP_PIPE } from '@nestjs/core';

import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { appConfig } from './config/app.config';
import { envValidationSchema } from './config/env.validation';
import { jwtConfig } from './config/jwt.config';
import { DatabaseModule } from './database/database.module';
import { SeedModule } from './database/seed/seed.module';
import { AuthModule } from './modules/auth/auth.module';
import { HealthModule } from './modules/health/health.module';
import { MoviesModule } from './modules/movies/movies.module';
import { ReservationsModule } from './modules/reservations/reservations.module';
import { ShowtimesModule } from './modules/showtimes/showtimes.module';
import { UsersModule } from './modules/users/users.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      load: [appConfig, jwtConfig],
      validationSchema: envValidationSchema,
      validationOptions: { abortEarly: false },
      envFilePath: ['.env.local', '.env'],
    }),
    DatabaseModule,
    HealthModule,
    AuthModule,
    UsersModule,
    MoviesModule,
    ShowtimesModule,
    ReservationsModule,
    SeedModule,
  ],
  providers: [
    {
      provide: APP_PIPE,
      useValue: new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
        transformOptions: { enableImplicitConversion: true },
      }),
    },
    {
      provide: APP_FILTER,
      useClass: AllExceptionsFilter,
    },
  ],
})
export class AppModule {}
