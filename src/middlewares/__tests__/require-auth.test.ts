import { describe, it, expect, vi, beforeEach } from 'vitest';
import express, { Application } from 'express';
import request from 'supertest';

vi.mock('@clerk/express', () => ({
  getAuth: vi.fn(),
}));

vi.mock('@/constants/status-code.ts', () => ({
  STATUS_CODE: {
    UNAUTHORIZED: 401,
  },
}));

vi.mock('@/constants/error-messages.ts', () => ({
  AUTH_ERROR: {
    AUTH_TOKEN_REQUIRED: 'Authentication token is required',
  },
}));

import { getAuth } from '@clerk/express';
import { requireAuth } from '@/middlewares/require-auth.ts';

const createApp = (): Application => {
  const app = express();
  app.get('/lesson', requireAuth, (_req, res) => res.sendStatus(200));
  return app;
};

describe('requireAuth', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should call next() when userId is present', async () => {
    vi.mocked(getAuth).mockReturnValue({ userId: 'user_123' } as any);

    const res = await request(createApp()).get('/lesson');

    expect(res.status).toBe(200);
  });

  it('should return 401 when userId is missing', async () => {
    vi.mocked(getAuth).mockReturnValue({ userId: null } as any);

    const res = await request(createApp()).get('/lesson');

    expect(res.status).toBe(401);
    expect(res.body).toEqual({
      error: 'Authentication token is required',
    });
  });
});
