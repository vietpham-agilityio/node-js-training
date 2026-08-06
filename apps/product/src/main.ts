import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { VersioningType } from '@nestjs/common';
import { Logger } from 'nestjs-pino';

// Docs
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

// Extensions
import { NextFunction, Request, Response } from 'express';

// Libs
import { VersionManagementMiddleware, applySecurityHeaders } from '@app/common';

// Module
import { ProductModule } from './product.module';

async function bootstrap() {
  const app = await NestFactory.create(ProductModule, { bufferLogs: true });
  app.useLogger(app.get(Logger));

  applySecurityHeaders(app, { httpsEnabled: false });

  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
  });

  const versionMiddleware = new VersionManagementMiddleware();

  app.use((req: Request, res: Response, next: NextFunction) =>
    versionMiddleware.use(req, res, next),
  );

  const config = new DocumentBuilder()
    .setTitle('Product Management API')
    .setDescription('API for managing products')
    .setVersion('1.0')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api-docs', app, document);

  await app.listen(3004);
}

void bootstrap();
