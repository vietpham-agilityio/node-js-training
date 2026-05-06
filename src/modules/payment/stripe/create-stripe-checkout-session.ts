import Stripe from 'stripe';

// Config
import { getStripeInstance } from '@/modules/payment/stripe/stripe-config.ts';

// Services
import type { CourseService } from '@/modules/course/course.service.ts';

// Constants
import { STATUS_CODE } from '@/constants/status-code.ts';
import { CHECKOUT_FALLBACK } from '@/constants/route.ts';
import { PAYMENT_ERROR } from '@/constants/error-messages.ts';

// Utils
import {
  parseCourseId,
  resolveAmountAndCurrency,
} from '@/modules/payment/utils/index.ts';

// Errors
import { AppError } from '@/types/error.ts';

export type CreateCourseCheckoutSessionParams = {
  readonly rawCourseId: string;
  readonly clerkUserId: string;
};

export const createCourseCheckoutSession = async (
  courseService: CourseService,
  params: CreateCourseCheckoutSessionParams,
): Promise<{ url: string }> => {
  const { clerkUserId, rawCourseId } = params;

  const courseId = parseCourseId(rawCourseId);
  const course = await courseService.findPublishedById(courseId);

  const stripe = getStripeInstance();

  const priceCents = Math.round(course.price * 100);

  const { unitAmount, currency } = resolveAmountAndCurrency({
    priceCents,
  });

  let session: Stripe.Checkout.Session;

  try {
    session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: [
        {
          price_data: {
            currency,
            unit_amount: unitAmount,
            product_data: {
              name: course.title,
              metadata: { courseId: course.id },
            },
          },
          quantity: 1,
        },
      ],
      success_url: CHECKOUT_FALLBACK.SUCCESS_URL,
      cancel_url: CHECKOUT_FALLBACK.CANCEL_URL,
      metadata: {
        courseId: course.id,
        clerkUserId: clerkUserId,
      },
    });
  } catch (error: unknown) {
    if (error instanceof Stripe.errors.StripeError) {
      throw new AppError(STATUS_CODE.BAD_REQUEST, error.message);
    }

    throw new AppError(
      STATUS_CODE.INTERNAL_SERVER_ERROR,
      PAYMENT_ERROR.CHECKOUT_FAILED,
    );
  }

  if (!session.url) {
    throw new AppError(
      STATUS_CODE.INTERNAL_SERVER_ERROR,
      PAYMENT_ERROR.CHECKOUT_FAILED,
    );
  }

  return { url: session.url };
};
