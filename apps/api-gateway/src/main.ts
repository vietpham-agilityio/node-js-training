import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { VersioningType } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import {
  VersionManagementMiddleware,
  applySecurityHeaders,
  loadHttpsOptions,
} from '@app/common';
import { NextFunction, Request, Response } from 'express';
import { Logger } from 'nestjs-pino';

async function bootstrap() {
  const httpsOptions = loadHttpsOptions();

  const app = await NestFactory.create(AppModule, {
    bufferLogs: true,
    httpsOptions,
  });

  app.useLogger(app.get(Logger));

  applySecurityHeaders(app, { httpsEnabled: Boolean(httpsOptions) });

  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
  });

  const config = new DocumentBuilder()
    .setTitle('API Gateway')
    .setDescription(
      'Aggregated client-facing API for order, inventory, user, and product services',
    )
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);

  SwaggerModule.setup('api-docs', app, document);

  const versionMiddleware = new VersionManagementMiddleware();
  app.use((req: Request, res: Response, next: NextFunction) =>
    versionMiddleware.use(req, res, next),
  );

  await app.listen(3002);
}

void bootstrap();
