import { RequestHandler, Router } from 'express';

// Services
import { UserService } from './user.service.ts';

// Controller
import { UserController } from './user.controller.ts';
import { UserCourseService } from '@/modules/userCourse/user-course.service.ts';
import { UserCourseController } from '../userCourse/user-course.controller.ts';

interface UserRouteDeps {
  userService: UserService;
  userCourseService: UserCourseService;
  requireAdmin: RequestHandler;
  requireAuth: RequestHandler;
}

export const createUserRoutes = ({
  userService,
  userCourseService,
  requireAdmin,
  requireAuth,
}: UserRouteDeps): Router => {
  const router = Router();

  const { getMyCourses } = new UserCourseController(userCourseService);
  const { getMe, findAll, findById, promoteToAdmin, deleteById } =
    new UserController(userService);

  /**
   * @openapi
   * /users/me:
   *   get:
   *     tags: [Users]
   *     summary: Get the authenticated user's own profile
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: Authenticated user's profile
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/UserResponse'
   *       401:
   *         $ref: '#/components/responses/Unauthorized'
   *       500:
   *         $ref: '#/components/responses/InternalServerError'
   */
  router.get('/me', requireAuth, getMe);

  /**
   * @openapi
   * /users/me/courses:
   *   get:
   *     tags: [Users]
   *     summary: List all courses the authenticated user has access to
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: Array of course belong user
   *         content:
   *           application/json:
   *             schema:
   *               type: array
   *               items:
   *                 $ref: '#/components/schemas/UserCourseResponse'
   *       401:
   *         $ref: '#/components/responses/Unauthorized'
   *       500:
   *         $ref: '#/components/responses/InternalServerError'
   */
  router.get('/me/courses', requireAuth, getMyCourses);

  /**
   * @openapi
   * /users/{id}:
   *   get:
   *     tags: [Users]
   *     summary: Get a single user by ID (admin only)
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - name: id
   *         in: path
   *         required: true
   *         description: Clerk user ID
   *         schema:
   *           type: string
   *           example: user_2abc123
   *     responses:
   *       200:
   *         description: User profile
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/UserResponse'
   *       401:
   *         $ref: '#/components/responses/Unauthorized'
   *       403:
   *         $ref: '#/components/responses/Forbidden'
   *       404:
   *         $ref: '#/components/responses/NotFound'
   *       500:
   *         $ref: '#/components/responses/InternalServerError'
   */
  router.get('/:id', requireAuth, findById);

  /**
   * @openapi
   * /users:
   *   get:
   *     tags: [Users]
   *     summary: List all users (admin only)
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: Array of all user profiles
   *         content:
   *           application/json:
   *             schema:
   *               type: array
   *               items:
   *                 $ref: '#/components/schemas/UserResponse'
   *       401:
   *         $ref: '#/components/responses/Unauthorized'
   *       403:
   *         $ref: '#/components/responses/Forbidden'
   *       500:
   *         $ref: '#/components/responses/InternalServerError'
   */
  router.get('/', requireAdmin, findAll);

  /**
   * @openapi
   * /users/{id}/promote:
   *   post:
   *     tags: [Users]
   *     summary: Promote a user to admin role
   *     description: Idempotent — returns 409 if the user is already an admin.
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - name: id
   *         in: path
   *         required: true
   *         description: Clerk user ID
   *         schema:
   *           type: string
   *           example: user_2abc123
   *     responses:
   *       200:
   *         description: Updated user profile with role=admin
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/UserResponse'
   *       401:
   *         $ref: '#/components/responses/Unauthorized'
   *       404:
   *         $ref: '#/components/responses/NotFound'
   *       409:
   *         description: User is already an admin
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ApiError'
   *             example:
   *               message: User already has the admin role.
   *       500:
   *         $ref: '#/components/responses/InternalServerError'
   */
  router.post('/:id/promote', promoteToAdmin);
  router.delete('/:id', requireAdmin, deleteById);

  return router;
};
