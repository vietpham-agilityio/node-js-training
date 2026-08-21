import Joi from 'joi';

/**
 * Every variable the app reads from the environment is declared here.
 * Nest fails to boot if one is missing or malformed, so a bad deploy
 * surfaces at startup instead of on the first request that needs it.
 */
export const envValidationSchema = Joi.object({
  NODE_ENV: Joi.string()
    .valid('development', 'test', 'production')
    .default('development'),
  PORT: Joi.number().port().default(3000),
  API_PREFIX: Joi.string().default('api'),
  API_VERSION: Joi.string().default('1'),
  CORS_ORIGIN: Joi.string().default('*'),
  SWAGGER_ENABLED: Joi.boolean().default(true),

  DB_HOST: Joi.string().hostname().required(),
  DB_PORT: Joi.number().port().default(5432),
  DB_USERNAME: Joi.string().required(),
  DB_PASSWORD: Joi.string().allow('').required(),
  DB_NAME: Joi.string().required(),
  DB_SYNCHRONIZE: Joi.boolean().default(false),
  DB_LOGGING: Joi.boolean().default(false),
  DB_SSL: Joi.boolean().default(false),

  // DDR-009: seeds the one admin no API route is allowed to create
  ADMIN_EMAIL: Joi.string().email().required(),
  ADMIN_PASSWORD: Joi.string().min(8).required(),

  // ADR-005: RS256 key pair, base64-encoded PEM, and token lifetimes
  JWT_PRIVATE_KEY_BASE64: Joi.string().required(),
  JWT_PUBLIC_KEY_BASE64: Joi.string().required(),
  JWT_ACCESS_TOKEN_TTL_SECONDS: Joi.number().positive().default(900),
  JWT_REFRESH_TOKEN_TTL_DAYS: Joi.number().positive().default(7),
});
