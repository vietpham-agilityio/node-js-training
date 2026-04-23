import { Router } from "express";

// Services
import { UserService } from "./user.service.ts";

// Controller
import { UserController } from "./user.controller.ts";

interface UserRouteDeps {
  userService: UserService;
}

export const createUserRoutes = ({ userService }: UserRouteDeps): Router => {
  const router = Router();
  const { getMe, findAll, findById, promoteToAdmin, deleteById } = new UserController(userService)

  // Router
  router.get('/me', getMe);
  router.get('/', findAll);
  router.post('/:id/promote', promoteToAdmin);
  router.get('/:id', findById);
  router.delete('/:id', deleteById);

  return router;
}
