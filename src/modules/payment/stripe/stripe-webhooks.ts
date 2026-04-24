import type { Request, RequestHandler, Response } from 'express';
import Stripe from 'stripe';

// Constants
import { STATUS_CODE } from '@/constants/status-code.ts';

// Services
import { getStripeInstance } from '@/modules/payment/stripe/stripe-config.ts';

import { handleStripeWebhookEvent } from './stripe-webhooks-handler.ts';

export const createStripeWebhookHandler =
  (): RequestHandler =>
    async (req: Request, res: Response): Promise<void> => {
      console.info(
        {
          originalUrl: req.originalUrl,
          contentType: req.headers['content-type'],
          bodyIsBuffer: Buffer.isBuffer(req.body),
        },
        'stripe webhook request received',
      );

      const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET?.trim();

      if (!webhookSecret) {
        res
          .status(STATUS_CODE.INTERNAL_SERVER_ERROR)
          .send('Stripe webhook secret is not configured');
        return;
      }

      const signature = req.headers['stripe-signature'];

      if (typeof signature !== 'string') {
        res
          .status(STATUS_CODE.BAD_REQUEST)
          .send('Missing Stripe-Signature header');
        return;
      }

      let event: Stripe.Event;

      try {
        const stripe = getStripeInstance();
        event = stripe.webhooks.constructEvent(
          req.body,
          signature,
          webhookSecret,
        );
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        res
          .status(STATUS_CODE.BAD_REQUEST)
          .send(`Webhook signature verification failed: ${message}`);
        return;
      }

      try {
        await handleStripeWebhookEvent(event);
      } catch (err: unknown) {
        console.error({ err }, 'Stripe webhook handler error');
        res
          .status(STATUS_CODE.INTERNAL_SERVER_ERROR)
          .json({ received: false, error: 'Handler failed' });
        return;
      }

      res.status(STATUS_CODE.OK).json({ received: true });
    };
