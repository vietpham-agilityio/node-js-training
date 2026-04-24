import type Stripe from 'stripe';

const shouldProcessCheckoutPayment = (
  session: Stripe.Checkout.Session,
): boolean => {
  if (session.mode !== 'payment') {
    return false;
  }

  return (
    session.payment_status === 'paid' ||
    session.payment_status === 'no_payment_required'
  );
};

const processPaidCourseCheckout = async (
  session: Stripe.Checkout.Session,
): Promise<void> => {

  if (!shouldProcessCheckoutPayment(session)) {
    console.warn(
      {
        sessionId: session.id,
        payment_status: session.payment_status,
        mode: session.mode,
      },
      'skipping checkout session (not a completed payment)',
    );

    return;
  }

  const courseId = session.metadata?.courseId;
  const clerkUserId = session.metadata?.clerkUserId;

  if (!courseId || !clerkUserId) {
    console.warn(
      {
        sessionId: session.id,
        hasCourseId: Boolean(courseId),
        hasClerkUserId: Boolean(clerkUserId),
      },
      'checkout.session completed without courseId/clerkUserId metadata',
    );

    return;
  }

  console.info(
    {
      event: 'course_checkout_paid',
      stripeSessionId: session.id,
      courseId: courseId,
      clerkUserId,
      amountTotal: session.amount_total,
      currency: session.currency,
      paymentStatus: session.payment_status,
    },
    'Course checkout payment confirmed via webhook',
  );
};

export const handleStripeWebhookEvent = async (
  event: Stripe.Event,
): Promise<void> => {
  switch (event.type) {
    case 'checkout.session.completed':
    case 'checkout.session.async_payment_succeeded':
      await processPaidCourseCheckout(
        event.data.object as Stripe.Checkout.Session,
      );
      break;
    default:
      console.warn(
        { type: event.type, id: event.id },
        'stripe webhook ignored',
      );
  }
};
