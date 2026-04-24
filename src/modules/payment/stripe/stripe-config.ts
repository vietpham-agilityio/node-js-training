import Stripe from 'stripe';

// Error
import { AppError } from '@/types/error.ts';

// Constant
import { STATUS_CODE } from '@/constants/status-code.ts';
import { PAYMENT_ERROR } from '@/constants/error-messages.ts'

let stripe: Stripe | null = null;

export const getStripeInstance = (): Stripe => {
  const stripeSecretKey = process.env.STRIPE_SECRET_KEY?.trim();

  if (!stripeSecretKey) {
    throw new AppError(
      STATUS_CODE.INTERNAL_SERVER_ERROR,
      PAYMENT_ERROR.CHECKOUT_STRIPE_NOT_CONFIGURED,
    );
  }

  if (!stripe) {
    stripe = new Stripe(stripeSecretKey);
  }

  return stripe;
}
