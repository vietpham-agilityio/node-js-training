import { RequestHandler, Router } from "express";

// Services
import { UserService } from "./user.service.ts";

// Controller
import { UserController } from "./user.controller.ts";

interface UserRouteDeps {
  userService: UserService;
  requireAdmin: RequestHandler;
  requireAuth: RequestHandler;
}

export const createUserRoutes = ({ userService, requireAdmin, requireAuth }: UserRouteDeps): Router => {
  const router = Router();
  const { getMe, findAll, findById, promoteToAdmin, deleteById } = new UserController(userService)

  // Router
  router.get('/me', requireAuth, getMe);
  router.get('/:id', requireAuth, findById);
  router.get('/', requireAdmin, findAll);
  router.post('/:id/promote', requireAdmin, promoteToAdmin);
  router.delete('/:id', requireAdmin, deleteById);

  return router;
}
