import type { Express } from 'express';
import swaggerUi from 'swagger-ui-express';
import swaggerJSDoc from 'swagger-jsdoc';

// Constant
import { ROUTES } from '@/constants/route.ts';
import { API_VERSION, ENABLE_API_DOCS } from '@/constants/environments.ts';

export const implementSwaggerUI = (app: Express): void => {
  if (!ENABLE_API_DOCS) return;

  const spec = swaggerJSDoc({
    definition: {
      openapi: '3.0.3',
      info: {
        title: 'English Learning Platform API',
        version: '2.0.0',
        description:
          'REST API for the English Learning Platform. ' +
          'Protected endpoints require a Clerk session JWT via `Authorization: Bearer <token>`.',
      },

      servers: [{ url: `/api/${API_VERSION ?? 'v1'}` }],
      components: {
        securitySchemes: {
          bearerAuth: {
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'JWT',
            description:
              'Clerk session JWT. In Swagger UI "Authorize", paste the token only (no `Bearer ` prefix).',
          },
        },
      },
    },
    apis: ['src/docs/schema.ts', 'src/modules/**/*.route.ts'],
  });

  app.use(ROUTES.DOCS, swaggerUi.serve, swaggerUi.setup(spec));
};
