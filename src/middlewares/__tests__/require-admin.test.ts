import { describe, it, expect, vi, beforeEach } from 'vitest';
import express, { Application } from 'express';
import request from 'supertest';

import { getAuth } from '@clerk/express';
import type { UserService } from '@/modules/user/user.service.js';

vi.mock('@clerk/express', () => ({
  getAuth: vi.fn(),
}));

vi.mock('@/constants/status-code.ts', () => ({
  STATUS_CODE: {
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
  },
}));

vi.mock('@/constants/enum.ts', () => ({
  USER_ROLE: {
    ADMIN: 'admin',
    USER: 'user',
  },
}));

vi.mock('@/constants/error-messages.ts', () => ({
  AUTH_ERROR: {
    AUTH_TOKEN_REQUIRED: 'Authentication token is required',
    ADMIN_REQUIRED: 'Admin role required',
  },
  USER_ERROR: {
    USER_NOT_FOUND: 'User not found',
  },
}));

import { createRequireAdmin } from '@/middlewares/require-admin.ts';

const mockUserService = {
  findById: vi.fn(),
} as unknown as UserService;

const createApp = (): Application => {
  const app = express();
  app.get('/test', createRequireAdmin(mockUserService), (_req, res) =>
    res.sendStatus(200),
  );
  return app;
};

describe('createRequireAdmin', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return 401 when userId is missing', async () => {
    vi.mocked(getAuth).mockReturnValue({} as any);

    const res = await request(createApp()).get('/test');

    expect(res.status).toBe(401);
    expect(res.body).toEqual({ error: 'Authentication token is required' });
  });

  it('should return 404 when user is not found', async () => {
    vi.mocked(getAuth).mockReturnValue({ userId: 'user_123' } as any);
    vi.mocked(mockUserService.findById).mockResolvedValue(null as any);

    const res = await request(createApp()).get('/test');

    expect(res.status).toBe(404);
    expect(res.body).toEqual({ error: 'User not found' });
  });

  it('should return 403 when user is not admin', async () => {
    vi.mocked(getAuth).mockReturnValue({ userId: 'user_123' } as any);
    vi.mocked(mockUserService.findById).mockResolvedValue({
      role: 'user',
    } as any);

    const res = await request(createApp()).get('/test');

    expect(res.status).toBe(403);
    expect(res.body).toEqual({ error: 'Admin role required' });
  });

  it('should call next() when user is admin', async () => {
    vi.mocked(getAuth).mockReturnValue({ userId: 'user_123' } as any);
    vi.mocked(mockUserService.findById).mockResolvedValue({
      role: 'admin',
    } as any);

    const res = await request(createApp()).get('/test');

    expect(res.status).toBe(200);
  });
});
