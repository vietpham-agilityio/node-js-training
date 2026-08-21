import { registerAs } from '@nestjs/config';

export interface JwtConfig {
  privateKey: string;
  publicKey: string;
  /** Access token lifetime, in seconds. */
  accessTokenTtlSeconds: number;
  /** Refresh token lifetime, in days. */
  refreshTokenTtlDays: number;
}

function decodeBase64Pem(value: string): string {
  return Buffer.from(value, 'base64').toString('utf8');
}

// ADR-005: access tokens are RS256 JWTs; the private key signs, the public
// key verifies, so verification never needs the signing secret.
export const jwtConfig = registerAs('jwt', (): JwtConfig => ({
  privateKey: decodeBase64Pem(process.env.JWT_PRIVATE_KEY_BASE64 ?? ''),
  publicKey: decodeBase64Pem(process.env.JWT_PUBLIC_KEY_BASE64 ?? ''),
  accessTokenTtlSeconds: parseInt(
    process.env.JWT_ACCESS_TOKEN_TTL_SECONDS ?? '900',
    10,
  ),
  refreshTokenTtlDays: parseInt(
    process.env.JWT_REFRESH_TOKEN_TTL_DAYS ?? '7',
    10,
  ),
}));
