import { Router } from "express";
import express from 'express';

// Services
import { UserService } from "@/modules/user/user.service.ts";

// Controller
import { AuthController } from "./auth.controller.ts";

interface AuthRouterDeps {
  userService: UserService;
}

export const createAuthRouter = ({ userService }: AuthRouterDeps): Router => {
  const router = Router();
  const { handleSyncClerkUser } = new AuthController(userService)

  // Router
  router.post(
    '/webhooks',
     express.raw({ type: 'application/json' }),
     handleSyncClerkUser,
    );

  return router;
}
