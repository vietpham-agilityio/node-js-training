import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { VersioningType } from '@nestjs/common';
import { Logger } from 'nestjs-pino';

// Docs
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

// Extensions
import { NextFunction, Request, Response } from 'express';

// Libs
import {
  VersionManagementMiddleware,
  applySecurityHeaders,
  loadHttpsOptions,
} from '@app/common';

// Module
import { AppModule } from './app.module';

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
