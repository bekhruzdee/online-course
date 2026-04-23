import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  CreateDateColumn,
  Unique,
  JoinColumn,
} from 'typeorm';
import { User } from 'src/users/entities/user.entity';
import { Course } from 'src/courses/entities/course.entity';

@Entity('enrollments')
@Unique(['user', 'course'])
export class Enrollment {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => User, (user) => user.enrollments, {
    onDelete: 'CASCADE',
    nullable: false,
  })
  @JoinColumn({ name: 'user_id' })
  user!: User;

  @ManyToOne(() => Course, (course) => course.enrollments, {
    onDelete: 'CASCADE',
    nullable: false,
  })
  @JoinColumn({ name: 'course_id' })
  course!: Course;

  @CreateDateColumn()
  enrolledAt!: Date;
}
