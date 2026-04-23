import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

import { COURSE_STATUS } from '@/constants/enum.ts';

@Entity('courses')
export class CourseEntity {
  @PrimaryGeneratedColumn()
  id!: number

  @Column({ type: 'text', length: 80 })
  title!: string;

  @Column({ type: 'text' })
  description!: string;

  @Column({ type: 'int' })
  price!: number;

  @Column({ type: 'boolean', default: false })
  isFree!: boolean

  @Column({ type: "text", default: COURSE_STATUS.UNPUBLISHED })
  status!: string;

  @CreateDateColumn({ type: 'datetime' })
  createdAt!: Date

  @UpdateDateColumn({ type: 'datetime' })
  updatedAt!: Date
}
