import { RequestHandler, Router } from 'express';

// Services
import type { CourseService } from '@/modules/course/course.service.ts';

// Controller
import { CourseController } from '@/modules/course/course.controller.ts';

export interface CourseRouterDeps {
  courseService: CourseService;
  requireAdmin: RequestHandler;
  requireAuth: RequestHandler;
}

export const createCourseRouter = ({
  courseService,
  requireAuth,
  requireAdmin,
}: CourseRouterDeps): Router => {
  const router = Router();

  const { list, listAll, getById, create, update, remove } =
    new CourseController(courseService);
  /**
   * @openapi
   * /courses:
   *   get:
   *     tags: [Courses]
   *     summary: List published courses
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: Array of published courses
   *         content:
   *           application/json:
   *             schema:
   *               type: array
   *               items:
   *                 $ref: '#/components/schemas/CourseResponse'
   *       401:
   *         $ref: '#/components/responses/Unauthorized'
   *       500:
   *         $ref: '#/components/responses/InternalServerError'
   */
  router.get('/', requireAuth, list);

  /**
   * @openapi
   * /courses/all:
   *   get:
   *     tags: [Courses]
   *     summary: List all courses including unpublished ones (admin only)
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: Array of all courses regardless of status
   *         content:
   *           application/json:
   *             schema:
   *               type: array
   *               items:
   *                 $ref: '#/components/schemas/CourseResponse'
   *       401:
   *         $ref: '#/components/responses/Unauthorized'
   *       403:
   *         $ref: '#/components/responses/Forbidden'
   *       500:
   *         $ref: '#/components/responses/InternalServerError'
   */
  router.get('/all', requireAdmin, listAll);

  /**
   * @openapi
   * /courses/{id}:
   *   get:
   *     tags: [Courses]
   *     summary: Get a single published course by ID
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - name: id
   *         in: path
   *         required: true
   *         description: Numeric course ID
   *         schema:
   *           type: integer
   *           example: 1
   *     responses:
   *       200:
   *         description: Course detail
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/CourseResponse'
   *       401:
   *         $ref: '#/components/responses/Unauthorized'
   *       404:
   *         $ref: '#/components/responses/NotFound'
   *       500:
   *         $ref: '#/components/responses/InternalServerError'
   */
  router.get('/:id', requireAuth, getById);

  /**
   * @openapi
   * /courses:
   *   post:
   *     tags: [Courses]
   *     summary: Create a new course (admin only)
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/CreateCourseRequest'
   *     responses:
   *       201:
   *         description: Course created
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/CourseResponse'
   *       400:
   *         description: Validation error
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ApiError'
   *       401:
   *         $ref: '#/components/responses/Unauthorized'
   *       403:
   *         $ref: '#/components/responses/Forbidden'
   *       500:
   *         $ref: '#/components/responses/InternalServerError'
   */
  router.post('/', requireAdmin, create);

  /**
   * @openapi
   * /courses/{id}:
   *   put:
   *     tags: [Courses]
   *     summary: Update a course (admin only)
   *     description: Partial update
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - name: id
   *         in: path
   *         required: true
   *         description: Numeric course ID
   *         schema:
   *           type: integer
   *           example: 1
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/UpdateCourseRequest'
   *     responses:
   *       200:
   *         description: Updated course
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/CourseResponse'
   *       400:
   *         description: Validation error or no fields provided
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ApiError'
   *       401:
   *         $ref: '#/components/responses/Unauthorized'
   *       403:
   *         $ref: '#/components/responses/Forbidden'
   *       404:
   *         $ref: '#/components/responses/NotFound'
   *       500:
   *         $ref: '#/components/responses/InternalServerError'
   */
  router.put('/:id', requireAdmin, update);

  /**
   * @openapi
   * /courses/{id}:
   *   delete:
   *     tags: [Courses]
   *     summary: Delete a course (admin only)
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - name: id
   *         in: path
   *         required: true
   *         description: Numeric course ID
   *         schema:
   *           type: integer
   *           example: 1
   *     responses:
   *       200:
   *         description: Course deleted
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/CourseDeleteResponse'
   *       401:
   *         $ref: '#/components/responses/Unauthorized'
   *       403:
   *         $ref: '#/components/responses/Forbidden'
   *       404:
   *         $ref: '#/components/responses/NotFound'
   *       500:
   *         $ref: '#/components/responses/InternalServerError'
   */
  router.delete('/:id', requireAdmin, remove);

  return router;
};
