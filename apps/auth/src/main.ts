import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { AuthModule } from './auth.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { Logger } from 'nestjs-pino';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    AuthModule,
    {
      transport: Transport.TCP,
      options: {
        port: 8003,
        host: '0.0.0.0',
      },
      bufferLogs: true,
    },
  );
  
  app.useLogger(app.get(Logger));

  await app.listen();
}

void bootstrap();
