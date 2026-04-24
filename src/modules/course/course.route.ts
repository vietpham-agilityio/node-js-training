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

  router.get('/', requireAuth, list);
  router.get('/all', requireAdmin, listAll);
  router.get('/:id', requireAuth, getById);
  router.post('/', requireAdmin, create);
  router.put('/:id', requireAdmin, update);
  router.delete('/:id', requireAdmin, remove);

  return router;
};
