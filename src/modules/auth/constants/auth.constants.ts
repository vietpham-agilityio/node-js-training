// Shared with src/database/seed/seed.service.ts so the seeded admin's
// password hash is produced the same way a real signup's would be.
export const BCRYPT_SALT_ROUNDS = 10;

export const REFRESH_TOKEN_BYTES = 64;
