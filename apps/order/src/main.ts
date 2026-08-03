import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { OrderModule } from './order.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';

async function bootstrap() {
  const app = await NestFactory.create(OrderModule);

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
