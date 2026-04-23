import 'reflect-metadata';
import express from 'express';
import { DataSource } from 'typeorm';
import type { Express, Request, Response, NextFunction } from 'express';

// Auth
import { clerkMiddleware } from '@clerk/express';

// Logger
import { pinoHttp } from 'pino-http';
import { createLogger } from '@/middlewares/logging.ts'

// Module
import { UserTypeORMRepository } from '@/modules/user/user.typeorm.ts';
import { UserService } from '@/modules/user/user.service.ts';
import { createUserRoutes } from '@/modules/user/user.route.ts';
import { createAuthRouter } from '@/modules/auth/auth.route.ts';
import { createCourseRouter } from '@/modules/course/course.route.ts';
import { CourseTypeORMRepository } from '@/modules/course/course.typeorm.ts';
import { CourseService } from '@/modules/course/course.service.ts';

// Middleware
import { globalErrorHandler } from '@/middlewares/error-handler.ts';

// Types
import { AppError } from '@/types/error.ts';

// Constants
import { STATUS_CODE } from '@/constants/status-code.ts';
import { ROUTES } from '@/constants/route.ts';

const createApp = (dataSource: DataSource): Express => {
  const app = express();

  // Middleware
  app.use(express.json());
  app.use(pinoHttp({ logger: createLogger() }))
  app.use(clerkMiddleware());

  const userRepository = new UserTypeORMRepository(dataSource)
  const userService = new UserService(userRepository)


  const courseRepository = new CourseTypeORMRepository(dataSource);
  const courseService = new CourseService(courseRepository);

  app.use(ROUTES.AUTH, createAuthRouter({ userService }));

  app.use(
    ROUTES.USERS,
    createUserRoutes({
      userService,
    }),
  );

  app.use(
    ROUTES.COURSES,
    createCourseRouter({
      courseService,
    }),
  );


  // Not-found handler
  app.use((_req: Request, _res: Response, next: NextFunction): void => {
    next(new AppError(STATUS_CODE.NOT_FOUND));
  });

  app.use(globalErrorHandler)

  return app;
};

export default createApp;
