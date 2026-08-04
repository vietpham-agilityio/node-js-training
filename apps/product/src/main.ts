import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { ProductModule } from './product.module';
import { VersioningType } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { VersionManagementMiddleware } from '@app/common';
import { NextFunction, Request, Response } from 'express';
import { Logger } from 'nestjs-pino';

async function bootstrap() {
  const app = await NestFactory.create(ProductModule, { bufferLogs: true });
  app.useLogger(app.get(Logger));

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
