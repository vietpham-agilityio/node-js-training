import 'dotenv/config';
import { DataSource } from 'typeorm';

import { buildDataSourceOptions } from './data-source.options';

/**
 * Entry point for the TypeORM CLI (`pnpm run migration:*`). The running app
 * never imports this file — it configures TypeORM through DatabaseModule.
 */
export default new DataSource(buildDataSourceOptions());
