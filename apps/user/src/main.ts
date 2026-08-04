import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { UserModule } from './user.module';
import { VersioningType } from '@nestjs/common';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { VersionManagementMiddleware } from '@app/common';
import { NextFunction, Request, Response } from 'express';
import { Logger } from 'nestjs-pino';

async function bootstrap() {
  const app = await NestFactory.create(UserModule, { bufferLogs: true });
  app.useLogger(app.get(Logger));

  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.TCP,
    options: {
      port: 8004,
      host: '0.0.0.0',
    },
  });

  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
  });

  const versionMiddleware = new VersionManagementMiddleware();
  app.use((req: Request, res: Response, next: NextFunction) =>
    versionMiddleware.use(req, res, next),
  );

  const config = new DocumentBuilder()
    .setTitle('User Management API')
    .setDescription('API for managing users')
    .setVersion('1.0')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api-docs', app, document);

  await app.startAllMicroservices();
  await app.listen(3003);
}

void bootstrap();
