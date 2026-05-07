import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  RelationId,
} from 'typeorm';

// Entity
import { UserEntity } from '@/modules/user/user.entity.ts';
import { CourseEntity } from '@/modules/course/course.entity.ts';

@Entity('user_courses')
export class UserCourseEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => UserEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user!: UserEntity;

  @RelationId((userCourse: UserCourseEntity) => userCourse.user)
  userId!: string;

  @ManyToOne(() => CourseEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'courseId' })
  course!: CourseEntity;

  @RelationId((userCourse: UserCourseEntity) => userCourse.course)
  courseId!: number;

  @Column({ type: 'text', nullable: true })
  stripeSessionId?: string | null;

  @CreateDateColumn({ name: 'grantedAt', type: 'timestamptz' })
  grantedAt!: Date;
}
