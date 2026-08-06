import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { VersioningType } from '@nestjs/common';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { Logger } from 'nestjs-pino';

// Docs
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

// Extensions
import { NextFunction, Request, Response } from 'express';

// Libs
import { VersionManagementMiddleware, applySecurityHeaders } from '@app/common';

// Module
import { UserModule } from './user.module';

async function bootstrap() {
  const app = await NestFactory.create(UserModule, { bufferLogs: true });
  app.useLogger(app.get(Logger));

  applySecurityHeaders(app, { httpsEnabled: false });

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
