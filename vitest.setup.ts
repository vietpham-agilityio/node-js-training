/**
 * Vitest setup runs before the test framework and each test file.
 * Keep env vars at top-level so they are available when the app loads.
 */
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-jwt-secret';
