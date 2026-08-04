import { NestFactory } from '@nestjs/core';
import { InventoryModule } from './inventory.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { Logger } from 'nestjs-pino';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    InventoryModule,
    {
      transport: Transport.TCP,
      options: {
        port: 8002,
        host: '0.0.0.0',
      },
      bufferLogs: true,
    },
  );
  app.useLogger(app.get(Logger));

  await app.listen();
}

void bootstrap();
