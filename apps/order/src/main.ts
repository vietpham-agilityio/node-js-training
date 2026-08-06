import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { Logger } from 'nestjs-pino';

// Libs
import { applySecurityHeaders } from '@app/common';

// Module
import { OrderModule } from './order.module';

async function bootstrap() {
  const app = await NestFactory.create(OrderModule, { bufferLogs: true });
  app.useLogger(app.get(Logger));

  applySecurityHeaders(app, { httpsEnabled: false });

  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.TCP,
    options: {
      port: 8001,
      host: '0.0.0.0',
    },
  });

  await app.startAllMicroservices();
  await app.listen(3001);
}

void bootstrap();
