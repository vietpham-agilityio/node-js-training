import { Router, type Request, type Response } from 'express';
import { getAuth } from '@clerk/express';
import type { RequestHandler } from 'express';

// Constants
import { AUTH_ERROR } from '@/constants/error-messages.ts';
import { STATUS_CODE } from '@/constants/status-code.ts';

// Services
import type { CourseService } from '@/modules/course//course.service.ts';

// Payment
import { createCourseCheckoutSession } from '@/modules/payment/stripe/create-stripe-checkout-session.ts';

export interface CoursePaymentRouterDeps {
  courseService: CourseService;
  requireAuth: RequestHandler;
}

/**
 * Stripe Checkout for course purchases.
 */
export const createCoursePaymentRouter = ({
  courseService,
  requireAuth,
}: CoursePaymentRouterDeps): Router => {
  const router = Router();

  router.post(
    '/:courseId/checkout',
    requireAuth,
    async (req: Request, res: Response): Promise<void> => {
      const { userId } = getAuth(req);

      if (!userId) {
        res.status(STATUS_CODE.UNAUTHORIZED).json({
          message: AUTH_ERROR.AUTH_TOKEN_REQUIRED,
        });

        return;
      }

      const { url } = await createCourseCheckoutSession(courseService, {
        rawCourseId: req.params.courseId as string,
        clerkUserId: userId,
      });

      res.status(STATUS_CODE.OK).json({ url });
    },
  );

  return router;
};
