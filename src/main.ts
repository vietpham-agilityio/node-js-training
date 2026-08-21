import { Logger, VersioningType } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';

import { AppModule } from './app.module';
import type { AppConfig } from './config/app.config';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);
  const { corsOrigin, apiPrefix, apiVersion, swaggerEnabled, port } = app
    .get(ConfigService)
    .getOrThrow<AppConfig>('app');

  app.use(helmet());
  app.enableCors({ origin: corsOrigin, credentials: true });
  app.setGlobalPrefix(apiPrefix);
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: apiVersion,
  });
  app.enableShutdownHooks();

  if (swaggerEnabled) {
    const document = SwaggerModule.createDocument(
      app,
      new DocumentBuilder()
        .setTitle('Movie Reservation System')
        .setDescription('Ticket reservation API')
        .setVersion(apiVersion)
        .addBearerAuth()
        .build(),
    );
    SwaggerModule.setup(`${apiPrefix}/docs`, app, document);
  }

  await app.listen(port);

  const logger = new Logger('Bootstrap');
  logger.log(`API listening on ${await app.getUrl()}/${apiPrefix}`);
  if (swaggerEnabled) {
    logger.log(`Swagger UI at ${await app.getUrl()}/${apiPrefix}/docs`);
  }
}

void bootstrap();
