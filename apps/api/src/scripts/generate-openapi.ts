import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';

import { NestFactory } from '@nestjs/core';

import { AppModule } from '../app.module';
import { buildOpenApiDocument } from '../swagger';

/**
 * Writes the API's OpenAPI document to `packages/api-contract/openapi.json`,
 * which `@movea/api-contract` turns into TypeScript for the mobile app.
 *
 * Runs in Nest's **preview mode**: the module graph is built and controller
 * metadata is read, but no provider is instantiated. That means no TypeORM
 * connection and — the reason it matters — no `SeedService.onApplicationBootstrap`,
 * so generating documentation never touches the database. It also means this
 * works with no database running at all, which is what lets CI regenerate and
 * diff the contract on a plain checkout.
 */
const OUTPUT_PATH = join(
  __dirname,
  '..',
  '..',
  '..',
  '..',
  'packages',
  'api-contract',
  'openapi.json',
);

async function generate(): Promise<void> {
  const app = await NestFactory.create(AppModule, {
    logger: false,
    preview: true,
  });
  await app.init();

  try {
    const document = buildOpenApiDocument(app, process.env.API_VERSION ?? '1');

    mkdirSync(dirname(OUTPUT_PATH), { recursive: true });
    writeFileSync(OUTPUT_PATH, `${JSON.stringify(document, null, 2)}\n`);

    const pathCount = Object.keys(document.paths).length;
    console.log(`Wrote ${pathCount} paths to ${OUTPUT_PATH}`);
  } finally {
    await app.close();
  }
}

generate().catch((error: unknown) => {
  console.error('Failed to generate the OpenAPI document.');
  console.error(error);
  process.exit(1);
});
