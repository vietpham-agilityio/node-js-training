import { Router } from 'express';

// Services
import type { CourseService } from '@/modules/course/course.service.ts';

// Controller
import { CourseController } from '@/modules/course/course.controller.ts';

export interface CourseRouterDeps {
  courseService: CourseService;
}

export const createCourseRouter = ({
  courseService,
}: CourseRouterDeps): Router => {
  const router = Router();

  const { list, listAll, getById, create, update, remove } =
    new CourseController(courseService);

  router.get('/', list);
  router.get('/all', listAll);
  router.get('/:id', getById);
  router.post('/', create);
  router.put('/:id', update);
  router.delete('/:id', remove);

  return router;
};
