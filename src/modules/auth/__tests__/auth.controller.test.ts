import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@clerk/express/webhooks', () => ({
  verifyWebhook: vi.fn(),
}));

import { verifyWebhook, WebhookEvent } from '@clerk/express/webhooks';
import { AuthController } from '@/modules/auth/auth.controller.ts';
import { UserService } from '@/modules/user/user.service.ts';
import type { Request, Response } from 'express';

const makeRes = () => {
  const res = {
    status: vi.fn(),
    json: vi.fn(),
  };

  res.status.mockReturnValue(res);
  res.json.mockReturnValue(res);

  return res;
};

describe('AuthController.handleSyncClerkUser', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    vi.spyOn(console, 'info').mockImplementation(() => undefined);
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
  });

  it('syncs user on user.created and returns 200', async () => {
    const userService = {
      syncUserProfile: vi.fn().mockResolvedValue(undefined),
      deleteUserById: vi.fn(),
    };

    const req = {} as Request;
    const res = makeRes();

    const controller = new AuthController(
      userService as unknown as UserService,
    );

    vi.mocked(verifyWebhook).mockResolvedValue({
      type: 'user.created',
      data: {
        id: 'user_122',
        email_addresses: [
          { id: 'user@gmail.com', email_address: 'user@gmail.com' },
        ],
        primary_email_address_id: 'user@gmail.com',
        first_name: 'A',
        last_name: 'B',
      },
    } as WebhookEvent);

    await controller.handleSyncClerkUser(req, res as unknown as Response);

    expect(userService.syncUserProfile).toHaveBeenCalledWith({
      id: 'user_122',
      email: 'user@gmail.com',
      firstName: 'A',
      lastName: 'B',
    });
    expect(userService.deleteUserById).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ received: true });
  });

  it('returns 200 and skips sync when primary email is missing', async () => {
    const userService = {
      syncUserProfile: vi.fn(),
      deleteUserById: vi.fn(),
    };
    const controller = new AuthController(
      userService as unknown as UserService,
    );
    const req = {} as Request;
    const res = makeRes();

    vi.mocked(verifyWebhook).mockResolvedValue({
      type: 'user.updated',
      data: {
        id: 'user_122',
        email_addresses: [
          { id: 'user@gmail.com', email_address: 'user@gmail.com' },
        ],
        first_name: null,
        last_name: null,
      },
    } as WebhookEvent);

    await controller.handleSyncClerkUser(req, res as unknown as Response);

    expect(userService.syncUserProfile).not.toHaveBeenCalled();
    expect(userService.deleteUserById).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ received: true });
  });

  it('deletes user on user.deleted and returns 200', async () => {
    const userService = {
      syncUserProfile: vi.fn(),
      deleteUserById: vi.fn().mockResolvedValue(undefined),
    };
    const controller = new AuthController(
      userService as unknown as UserService,
    );
    const req = {} as Request;
    const res = makeRes();

    vi.mocked(verifyWebhook).mockResolvedValue({
      type: 'user.deleted',
      data: { id: 'user_122' },
    } as WebhookEvent);

    await controller.handleSyncClerkUser(req, res as unknown as Response);

    expect(userService.deleteUserById).toHaveBeenCalledWith('user_122');
    expect(userService.syncUserProfile).not.toHaveBeenCalled();

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ received: true });
  });

  it('returns 400 when webhook verification fails', async () => {
    const userService = {
      syncUserProfile: vi.fn(),
      deleteUserById: vi.fn(),
    };
    const controller = new AuthController(
      userService as unknown as UserService,
    );
    const req = {} as Request;
    const res = makeRes();

    vi.mocked(verifyWebhook).mockRejectedValue(new Error('bad signature'));

    await controller.handleSyncClerkUser(req, res as unknown as Response);

    expect(userService.syncUserProfile).not.toHaveBeenCalled();
    expect(userService.deleteUserById).not.toHaveBeenCalled();

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      error: 'Webhook verification failed',
    });
  });
});
