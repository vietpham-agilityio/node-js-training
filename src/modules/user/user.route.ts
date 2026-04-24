import { RequestHandler, Router } from "express";

// Services
import { UserService } from "./user.service.ts";

// Controller
import { UserController } from "./user.controller.ts";
import { UserCourseService } from "@/modules/userCourse/user-course.service.ts";
import { UserCourseController } from "../userCourse/user-course.controller.ts";

interface UserRouteDeps {
  userService: UserService;
  userCourseService: UserCourseService;
  requireAdmin: RequestHandler;
  requireAuth: RequestHandler;
}

export const createUserRoutes = ({ userService, userCourseService, requireAdmin, requireAuth }: UserRouteDeps): Router => {
  const router = Router();

  const { getMyCourses } = new UserCourseController(userCourseService);
  const { getMe, findAll, findById, promoteToAdmin, deleteById } = new UserController(userService)

  // Router
  router.get('/me', requireAuth, getMe);
  router.get('/me/courses', requireAuth, getMyCourses);
  router.get('/:id', requireAuth, findById);
  router.get('/', requireAdmin, findAll);
  router.post('/:id/promote', requireAdmin, promoteToAdmin);
  router.delete('/:id', requireAdmin, deleteById);

  return router;
}
