import { join } from 'node:path';
import type { DataSourceOptions } from 'typeorm';

/**
 * Minimal shape shared by Nest's ConfigService and the plain-`process.env`
 * reader the TypeORM CLI uses, so both build identical connection options.
 */
export interface EnvReader {
  get<T = string>(key: string): T | undefined;
}

export const processEnvReader: EnvReader = {
  get: <T = string>(key: string) => process.env[key] as T | undefined,
};

const toBoolean = (value: unknown, fallback = false): boolean => {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'string') return value.toLowerCase() === 'true';
  return fallback;
};

export const buildDataSourceOptions = (
  env: EnvReader = processEnvReader,
): DataSourceOptions => ({
  type: 'postgres',
  host: env.get('DB_HOST') ?? 'localhost',
  port: Number(env.get('DB_PORT') ?? 5432),
  username: env.get('DB_USERNAME'),
  password: env.get('DB_PASSWORD'),
  database: env.get('DB_NAME'),
  ssl: toBoolean(env.get('DB_SSL')) ? { rejectUnauthorized: false } : false,
  synchronize: toBoolean(env.get('DB_SYNCHRONIZE')),
  logging: toBoolean(env.get('DB_LOGGING')),
  entities: [join(__dirname, '..', '**', '*.entity.{ts,js}')],
  migrations: [join(__dirname, 'migrations', '*.{ts,js}')],
  migrationsTableName: 'typeorm_migrations',
});
