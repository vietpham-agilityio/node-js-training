import { beforeEach, describe, expect, it, vi } from 'vitest';

// Constants
import { STATUS_CODE } from '@/constants/status-code.ts';

// Modules
import { getStripeInstance } from '@/modules/payment/stripe/stripe-config.ts';
import { handleStripeWebhookEvent } from '@/modules/payment/stripe/stripe-webhooks-handler.ts';
import { createStripeWebhookHandler } from '@/modules/payment/stripe/stripe-webhooks.ts';
import { UserCourseService } from '@/modules/userCourse/user-course.service.ts';

vi.mock('@/modules/payment/stripe/stripe-config.ts', () => ({
  getStripeInstance: vi.fn(),
}));

vi.mock('@/modules/payment/stripe/stripe-webhooks-handler.ts', () => ({
  handleStripeWebhookEvent: vi.fn(),
}));

type MockRes = {
  status: ReturnType<typeof vi.fn>;
  send: ReturnType<typeof vi.fn>;
  json: ReturnType<typeof vi.fn>;
};

const makeRes = (): MockRes => {
  const res = {} as MockRes;
  res.status = vi.fn().mockImplementation(() => res);
  res.send = vi.fn().mockImplementation(() => res);
  res.json = vi.fn().mockImplementation(() => res);
  return res;
};

describe('createStripeWebhookHandler', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.STRIPE_WEBHOOK_SECRET = 'whsec_test';
    vi.mocked(handleStripeWebhookEvent).mockResolvedValue(undefined);
  });

  it('returns 500 when STRIPE_WEBHOOK_SECRET is missing', async () => {
    delete process.env.STRIPE_WEBHOOK_SECRET;

    const stripeWebhookHandler = createStripeWebhookHandler(
      {} as UserCourseService,
    );

    const req = {
      originalUrl: '/webhooks/stripe',
      headers: { 'content-type': 'application/json' },
      body: Buffer.from(''),
    } as never;

    const res = makeRes();

    await stripeWebhookHandler(req, res as never, undefined as never);

    expect(res.status).toHaveBeenCalledWith(STATUS_CODE.INTERNAL_SERVER_ERROR);
    expect(res.send).toHaveBeenCalledWith(
      'Stripe webhook secret is not configured',
    );
  });

  it('returns 400 when stripe-signature header is missing', async () => {
    const stripeWebhookHandler = createStripeWebhookHandler(
      {} as UserCourseService,
    );
    const req = {
      originalUrl: '/webhooks/stripe',
      headers: { 'content-type': 'application/json' },
      body: Buffer.from(''),
    } as never;

    const res = makeRes();

    await stripeWebhookHandler(req, res as never, undefined as never);

    expect(res.status).toHaveBeenCalledWith(STATUS_CODE.BAD_REQUEST);
    expect(res.send).toHaveBeenCalledWith('Missing Stripe-Signature header');
  });

  it('returns 400 when signature verification fails', async () => {
    const constructEvent = vi.fn().mockImplementation(() => {
      throw new Error('bad signature');
    });

    vi.mocked(getStripeInstance).mockReturnValue({
      webhooks: { constructEvent },
    } as never);

    const stripeWebhookHandler = createStripeWebhookHandler(
      {} as UserCourseService,
    );
    const req = {
      originalUrl: '/webhooks/stripe',
      headers: {
        'content-type': 'application/json',
        'stripe-signature': 'sig_test',
      },
      body: Buffer.from('raw'),
    } as never;

    const res = makeRes();

    await stripeWebhookHandler(req, res as never, undefined as never);

    expect(res.status).toHaveBeenCalledWith(STATUS_CODE.BAD_REQUEST);
    expect(res.send).toHaveBeenCalledWith(
      'Webhook signature verification failed: bad signature',
    );
  });

  it('returns 500 when handler fails', async () => {
    const event = { id: 'evt_1', type: 'checkout.session.completed' };

    vi.mocked(getStripeInstance).mockReturnValue({
      webhooks: { constructEvent: vi.fn().mockReturnValue(event) },
    } as never);

    vi.mocked(handleStripeWebhookEvent).mockRejectedValueOnce(
      new Error('something went wrong'),
    );

    const stripeWebhookHandler = createStripeWebhookHandler(
      {} as UserCourseService,
    );
    const req = {
      originalUrl: '/webhooks/stripe',
      headers: {
        'content-type': 'application/json',
        'stripe-signature': 'sig_test',
      },
      body: Buffer.from('raw'),
    } as never;

    const res = makeRes();

    await stripeWebhookHandler(req, res as never, undefined as never);

    expect(res.status).toHaveBeenCalledWith(STATUS_CODE.INTERNAL_SERVER_ERROR);
  });

  it('returns 200 when webhook is processed successfully', async () => {
    const event = { id: 'evt_1', type: 'checkout.session.completed' };
    vi.mocked(getStripeInstance).mockReturnValue({
      webhooks: { constructEvent: vi.fn().mockReturnValue(event) },
    } as never);

    const userCourseService = {} as never;
    const stripeWebhookHandler = createStripeWebhookHandler(userCourseService);
    const req = {
      originalUrl: '/webhooks/stripe',
      headers: {
        'content-type': 'application/json',
        'stripe-signature': 'sig_test',
      },
      body: Buffer.from('raw'),
    } as never;

    const res = makeRes();

    await stripeWebhookHandler(req, res as never, undefined as never);

    expect(handleStripeWebhookEvent).toHaveBeenCalledWith(
      event,
      userCourseService,
    );
    expect(res.status).toHaveBeenCalledWith(STATUS_CODE.OK);
  });
});
