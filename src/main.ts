import { Logger, VersioningType } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';

import { AppModule } from './app.module';
import type { AppConfig } from './config/app.config';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);
  const config = app.get(ConfigService).getOrThrow<AppConfig>('app');

  app.use(helmet());
  app.enableCors({ origin: config.corsOrigin, credentials: true });
  app.setGlobalPrefix(config.apiPrefix);
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: config.apiVersion,
  });
  app.enableShutdownHooks();

  if (config.swaggerEnabled) {
    const document = SwaggerModule.createDocument(
      app,
      new DocumentBuilder()
        .setTitle('Movie Reservation System')
        .setDescription('Ticket reservation API')
        .setVersion(config.apiVersion)
        .addBearerAuth()
        .build(),
    );
    SwaggerModule.setup(`${config.apiPrefix}/docs`, app, document);
  }

  await app.listen(config.port);

  const logger = new Logger('Bootstrap');
  logger.log(`API listening on ${await app.getUrl()}/${config.apiPrefix}`);
  if (config.swaggerEnabled) {
    logger.log(`Swagger UI at ${await app.getUrl()}/${config.apiPrefix}/docs`);
  }
}

void bootstrap();
