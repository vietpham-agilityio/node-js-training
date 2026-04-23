import { type Request, type Response } from 'express';
import { getAuth } from '@clerk/express';

// Error
import { AppError } from '@/types/error.ts';

// Constants
import { STATUS_CODE } from '@/constants/status-code.ts';
import { USER_ERROR } from '@/constants/error-messages.ts';

// Services
import type { UserService } from '@/modules/user/user.service.js';

export class UserController {
  constructor(private readonly userService: UserService) { }

  getMe = async (req: Request, res: Response): Promise<void> => {
    const { userId } = getAuth(req);

    if (!userId) {
      throw new AppError(
        STATUS_CODE.UNAUTHORIZED,
        USER_ERROR.USER_NOT_FOUND,
      );
    }

    const user = await this.userService.findById(userId);

    res.status(STATUS_CODE.OK).json(user);
  };

  findAll = async (_req: Request, res: Response): Promise<void> => {
    const users = await this.userService.findAll();

    res.status(STATUS_CODE.OK).json(users);
  };

  findById = async (req: Request, res: Response): Promise<void> => {
    const targetId = req.params.id as string;

    const user = await this.userService.findById(targetId);

    res.status(STATUS_CODE.OK).json(user);
  };

  promoteToAdmin = async (req: Request, res: Response): Promise<void> => {
    const targetId = req.params.id as string;

    const user = await this.userService.promoteUserToAdmin(targetId);

    res.status(STATUS_CODE.OK).json(user);
  };

   deleteById = async (req: Request, res: Response): Promise<void> => {
    const targetId = req.params.id as string;

    await this.userService.deleteUserById(targetId);

    res.status(STATUS_CODE.OK).json({ message: 'User is deleted successfully' });
  };
}
