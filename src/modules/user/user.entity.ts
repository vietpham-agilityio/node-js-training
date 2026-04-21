import {
  Entity,
  Column,
  PrimaryColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm'

// Constant
import { USER_ROLE } from '@/constants/enum.ts'

@Entity('users')
export class UserEntity {
  @PrimaryColumn({ type: 'text' })
  id!: string;

  @Column({ type: 'text', unique: true })
  email!: string;

  @Column({ type: 'text', nullable: true })
  firstName?: string;

  @Column({ type: 'text', nullable: true })
  lastName?: string;

  @Column({ type: 'text', default: USER_ROLE.USER })
  role!: string;

  @CreateDateColumn({ type: 'datetime' })
  createAt!: Date

  @UpdateDateColumn({ type: 'datetime' })
  updateAt!: Date
}
