import { DataSource } from 'typeorm';

// Constant
import {
  NODE_ENV,
  DB_PORT,
  DB_HOST,
  DB_USER,
  DB_PASSWORD,
  DB_NAME,
} from '@/constants/environments.ts';

// Entity
import { UserEntity } from '@/modules/user/user.entity.ts';
import { CourseEntity } from '@/modules/course/course.entity.ts';
import { UserCourseEntity } from '@/modules/userCourse/user-course.entity.ts';

// Migration
import { CreateCoursesTable1709000000007 } from '@/migrations/CreateCoursesTable1709000000007.ts';
import { CreateUsersTable1709000000006 } from '@/migrations/CreateUsersTable1709000000006.ts';
import { CreateUserCoursesTable1709000000013 } from '@/migrations/CreateUserCoursesTable1709000000013.ts';

export const AppDataSource = new DataSource({
  type: 'postgres',
  port: DB_PORT,
  host: DB_HOST,
  username: DB_USER,
  password: DB_PASSWORD,
  database: DB_NAME,
  entities: [UserEntity, CourseEntity, UserCourseEntity],
  migrations: [
    CreateUsersTable1709000000006,
    CreateCoursesTable1709000000007,
    CreateUserCoursesTable1709000000013,
  ],
  migrationsRun: true,
  synchronize: false,
  logging: NODE_ENV === 'dev',
});
