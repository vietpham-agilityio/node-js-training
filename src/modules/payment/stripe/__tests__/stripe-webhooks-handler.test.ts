import Stripe from 'stripe';
import { beforeEach, describe, expect, it, vi } from 'vitest';

// Modules
import { handleStripeWebhookEvent } from '@/modules/payment/stripe/stripe-webhooks-handler.ts';
import { UserCourseService } from '@/modules/userCourse/user-course.service.ts';
import { UserCourseResponse } from '@/modules/userCourse/user-course.repository.ts';

const makeUserCourseService = (): Partial<UserCourseService> => {
  const grantCourseAccess = vi.fn();
  return { grantCourseAccess };
};

const makeCheckoutSession = (
  overrides: Partial<Stripe.Checkout.Session> = {},
): Stripe.Checkout.Session => {
  return {
    id: 'cs_test_1',
    mode: 'payment',
    payment_status: 'paid',
    metadata: { courseId: '1', clerkUserId: 'user_1' },
    amount_total: 999,
    currency: 'usd',
    ...overrides,
  } as Stripe.Checkout.Session;
};

const makeEvent = (
  type: string,
  session: Stripe.Checkout.Session,
): Stripe.Event =>
  ({
    id: 'evt_1',
    type,
    data: { object: session },
  }) as Stripe.Event;

describe('handleStripeWebhookEvent', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('ignores unhandled event types', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);

    const userCourseService = makeUserCourseService();

    await expect(
      handleStripeWebhookEvent(
        makeEvent('customer.created', makeCheckoutSession()),
        userCourseService as UserCourseService,
      ),
    ).resolves.toBeUndefined();

    expect(userCourseService.grantCourseAccess).not.toHaveBeenCalled();
    expect(warn).toHaveBeenCalledWith(
      { type: 'customer.created', id: 'evt_1' },
      'stripe webhook ignored',
    );
  });

  it('skips checkout session when mode is not payment', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    const userCourseService = makeUserCourseService();
    const session = makeCheckoutSession({ mode: 'subscription' });

    await handleStripeWebhookEvent(
      makeEvent('checkout.session.completed', session),
      userCourseService as any,
    );

    expect(userCourseService.grantCourseAccess).not.toHaveBeenCalled();
    expect(warn).toHaveBeenCalledWith(
      expect.objectContaining({
        sessionId: 'cs_test_1',
        payment_status: 'paid',
        mode: 'subscription',
      }),
      'skipping checkout session (not a completed payment)',
    );
  });

  it('skips checkout session when payment_status is not paid/no_payment_required', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    const userCourseService = makeUserCourseService();
    const session = makeCheckoutSession({ payment_status: 'unpaid' });

    await handleStripeWebhookEvent(
      makeEvent('checkout.session.async_payment_succeeded', session),
      userCourseService as UserCourseService,
    );

    expect(userCourseService.grantCourseAccess).not.toHaveBeenCalled();
    expect(warn).toHaveBeenCalledWith(
      expect.objectContaining({
        sessionId: 'cs_test_1',
        payment_status: 'unpaid',
        mode: 'payment',
      }),
      'skipping checkout session (not a completed payment)',
    );
  });

  it('skips checkout session when metadata is missing courseId/clerkUserId', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    const userCourseService = makeUserCourseService();
    const session = makeCheckoutSession({ metadata: {} });

    await handleStripeWebhookEvent(
      makeEvent('checkout.session.completed', session),
      userCourseService as UserCourseService,
    );

    expect(userCourseService.grantCourseAccess).not.toHaveBeenCalled();
    expect(warn).toHaveBeenCalledWith(
      expect.objectContaining({
        sessionId: 'cs_test_1',
        hasCourseId: false,
        hasClerkUserId: false,
      }),
      'checkout.session completed without courseId/clerkUserId metadata',
    );
  });

  it('grants course access for paid checkout sessions', async () => {
    const info = vi.spyOn(console, 'info').mockImplementation(() => undefined);
    const userCourseService = makeUserCourseService();
    vi.mocked(
      (userCourseService as UserCourseService).grantCourseAccess,
    ).mockResolvedValue({ id: 1 } as UserCourseResponse);

    const session = makeCheckoutSession({
      id: 'cs_123',
      metadata: { courseId: '42', clerkUserId: 'user_abc' },
      payment_status: 'paid',
    });

    await handleStripeWebhookEvent(
      makeEvent('checkout.session.completed', session),
      userCourseService as UserCourseService,
    );

    expect(userCourseService.grantCourseAccess).toHaveBeenCalledWith(
      'user_abc',
      42,
      'cs_123',
    );

    expect(info).toHaveBeenCalledWith(
      expect.objectContaining({
        event: 'course_checkout_paid',
        stripeSessionId: 'cs_123',
        userCourseId: 1,
        courseId: '42',
        clerkUserId: 'user_abc',
      }),
      'Course checkout payment confirmed via webhook',
    );
  });
});
