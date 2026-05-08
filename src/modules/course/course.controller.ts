import { type Request, type Response } from 'express';

// Constants
import { STATUS_CODE } from '@/constants/status-code.ts';

// Services
import type { CourseService } from '@/modules/course/course.service.ts';

export class CourseController {
  constructor(private readonly courseService: CourseService) {}

  list = async (_req: Request, res: Response): Promise<void> => {
    const courses = await this.courseService.findAll();

    res.status(STATUS_CODE.OK).json(courses);
  };

  listAll = async (_req: Request, res: Response): Promise<void> => {
    const courses = await this.courseService.findAllForAdmin();
    res.status(STATUS_CODE.OK).json(courses);
  };

  getById = async (req: Request, res: Response): Promise<void> => {
    const course = await this.courseService.findPublishedById(
      req.params.id as string,
    );

    res.status(STATUS_CODE.OK).json(course);
  };

  create = async (req: Request, res: Response): Promise<void> => {
    const body = req.body;

    const course = await this.courseService.create(body);

    res.status(STATUS_CODE.CREATED).json(course);
  };

  update = async (req: Request, res: Response): Promise<void> => {
    const body = req.body;

    const course = await this.courseService.update(
      req.params.id as string,
      body,
    );

    res.status(STATUS_CODE.OK).json(course);
  };

  remove = async (req: Request, res: Response): Promise<void> => {
    await this.courseService.delete(req.params.id as string);
    res
      .status(STATUS_CODE.OK)
      .json({ message: 'Course is deleted successfully' });
  };
}
