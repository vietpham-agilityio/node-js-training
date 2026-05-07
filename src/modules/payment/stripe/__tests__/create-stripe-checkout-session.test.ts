import { beforeEach, describe, expect, it, vi } from 'vitest';
import Stripe from 'stripe';

vi.mock('@/modules/payment/stripe/stripe-config.ts', () => ({
  getStripeInstance: vi.fn(),
}));

import { getStripeInstance } from '@/modules/payment/stripe/stripe-config.ts';
import { createCourseCheckoutSession } from '@/modules/payment/stripe/create-stripe-checkout-session.ts';

// Constants
import { COURSE_ERROR, PAYMENT_ERROR } from '@/constants/error-messages.ts';
import { STATUS_CODE } from '@/constants/status-code.ts';
import { CHECKOUT_FALLBACK } from '@/constants/route.ts';
import { COURSE_STATUS } from '@/constants/enum.ts';

// Types
import type { CourseService } from '@/modules/course/course.service.ts';
import type { Course } from '@/modules/course/course.repository.ts';
import type { APIResponse } from '@/types/response.ts';

const dates = {
  createdAt: new Date('2026-05-01'),
  updatedAt: new Date('2026-05-02'),
};

const publishedCourse = (): APIResponse<Course> => ({
  id: '42',
  title: 'English for Beginners',
  description: 'A structured introduction to English fundamentals',
  price: 9.99,
  isFree: false,
  status: COURSE_STATUS.PUBLISHED,
  ...dates,
});

const makeCourseService = (
  partial: Partial<Pick<CourseService, 'findPublishedById'>> = {},
): CourseService =>
  ({
    findPublishedById: vi.fn(),
    ...partial,
  }) as unknown as CourseService;

describe('createCourseCheckoutSession', () => {
  const checkoutCreate = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    checkoutCreate.mockResolvedValue({
      url: 'https://checkout.stripe.com/session',
    });
    vi.mocked(getStripeInstance).mockReturnValue({
      checkout: {
        sessions: {
          create: checkoutCreate,
        },
      },
    } as unknown as Stripe);
  });

  it('returns checkout URL and creates session', async () => {
    const course = publishedCourse();
    const courseService = makeCourseService({
      findPublishedById: vi.fn().mockResolvedValue(course),
    });

    await expect(
      createCourseCheckoutSession(courseService, {
        rawCourseId: '42',
        clerkUserId: 'user_abc',
      }),
    ).resolves.toEqual({ url: 'https://checkout.stripe.com/session' });

    expect(courseService.findPublishedById).toHaveBeenCalledWith('42');
    expect(checkoutCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        mode: 'payment',
        success_url: CHECKOUT_FALLBACK.SUCCESS_URL,
        cancel_url: CHECKOUT_FALLBACK.CANCEL_URL,
        metadata: {
          courseId: course.id,
          clerkUserId: 'user_abc',
        },
      }),
    );
  });

  it('rejects invalid course id before loading the course', async () => {
    const courseService = makeCourseService();

    await expect(
      createCourseCheckoutSession(courseService, {
        rawCourseId: '  ',
        clerkUserId: 'user_abc',
      }),
    ).rejects.toMatchObject({
      status: STATUS_CODE.BAD_REQUEST,
      message: COURSE_ERROR.COURSE_INVALID_ID,
    });

    expect(courseService.findPublishedById).not.toHaveBeenCalled();
  });

  it('maps Stripe API errors to bad request with the Stripe message', async () => {
    const courseService = makeCourseService({
      findPublishedById: vi.fn().mockResolvedValue(publishedCourse()),
    });

    const stripeMessage = 'No such price';
    checkoutCreate.mockRejectedValue(
      new Stripe.errors.StripeInvalidRequestError({
        message: stripeMessage,
        type: 'invalid_request_error',
      }),
    );

    await expect(
      createCourseCheckoutSession(courseService, {
        rawCourseId: '42',
        clerkUserId: 'user_abc',
      }),
    ).rejects.toMatchObject({
      status: STATUS_CODE.BAD_REQUEST,
      message: stripeMessage,
    });
  });

  it('maps non-Stripe errors to checkout failed', async () => {
    const courseService = makeCourseService({
      findPublishedById: vi.fn().mockResolvedValue(publishedCourse()),
    });
    checkoutCreate.mockRejectedValue(new Error('network'));

    await expect(
      createCourseCheckoutSession(courseService, {
        rawCourseId: '42',
        clerkUserId: 'user_abc',
      }),
    ).rejects.toMatchObject({
      status: STATUS_CODE.INTERNAL_SERVER_ERROR,
      message: PAYMENT_ERROR.CHECKOUT_FAILED,
    });
  });

  it('fails when Stripe returns no checkout URL', async () => {
    const courseService = makeCourseService({
      findPublishedById: vi.fn().mockResolvedValue(publishedCourse()),
    });

    checkoutCreate.mockResolvedValue({ url: null });

    await expect(
      createCourseCheckoutSession(courseService, {
        rawCourseId: '42',
        clerkUserId: 'user_abc',
      }),
    ).rejects.toMatchObject({
      status: STATUS_CODE.INTERNAL_SERVER_ERROR,
      message: PAYMENT_ERROR.CHECKOUT_FAILED,
    });
  });
});
