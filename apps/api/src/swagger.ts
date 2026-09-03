import type { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import type { OpenAPIObject } from '@nestjs/swagger';

/**
 * Single definition of the OpenAPI document. Two consumers rely on it being
 * one function: `main.ts` serves it at `/{apiPrefix}/docs`, and
 * `scripts/generate-openapi.ts` writes it to disk for `@movea/api-contract`.
 * If they built the document separately the published contract could drift
 * from what the running API actually serves.
 */
export function buildOpenApiDocument(
  app: INestApplication,
  apiVersion: string,
): OpenAPIObject {
  return SwaggerModule.createDocument(
    app,
    new DocumentBuilder()
      .setTitle('Movie Reservation System')
      .setDescription('Ticket reservation API')
      .setVersion(apiVersion)
      .addBearerAuth()
      .build(),
  );
}
