import { Router, type Request, type Response } from 'express';
import { getAuth } from '@clerk/express';
import type { RequestHandler } from 'express';

// Constants
import { AUTH_ERROR } from '@/constants/error-messages.ts';
import { STATUS_CODE } from '@/constants/status-code.ts';

// Services
import type { CourseService } from '@/modules/course/course.service.ts';

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

  /**
   * @openapi
   * /courses/{courseId}/checkout:
   *   post:
   *     tags: [Payments]
   *     summary: Create a Stripe Checkout Session for a course purchase
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - name: courseId
   *         in: path
   *         required: true
   *         description: Numeric ID of the course to purchase
   *         schema:
   *           type: integer
   *           example: 5
   *     responses:
   *       200:
   *         description: Stripe Checkout Session URL
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/CheckoutSessionResponse'
   *       400:
   *         $ref: '#/components/responses/Invalid'
   *       401:
   *         $ref: '#/components/responses/Unauthorized'
   *       404:
   *         description: Course not found
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ApiError'
   *       500:
   *         description: Stripe is not configured or session creation failed
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ApiError'
   */
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
