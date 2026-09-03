import { registerAs } from '@nestjs/config';

export interface ThrottleConfig {
  /** Window length, in milliseconds. */
  ttlMs: number;
  /** Requests allowed per client within the window. */
  limit: number;
}

// In-memory rate limiting, same reasoning as ADR-009's rejection of Redis
// for the seat-hold sweep: disproportionate for this project's traffic.
export const throttleConfig = registerAs('throttle', (): ThrottleConfig => ({
  ttlMs: parseInt(process.env.THROTTLE_TTL_SECONDS ?? '60', 10) * 1000,
  limit: parseInt(process.env.THROTTLE_LIMIT ?? '100', 10),
}));
