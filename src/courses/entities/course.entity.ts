import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { User } from 'src/users/entities/user.entity';

export enum CourseStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
}

@Entity('courses')
export class Course {
  @PrimaryGeneratedColumn()
  id: number;

  @Index()
  @Column()
  title: string;

  @Column('text')
  description: string;

  @Column({ type: 'decimal', default: 0 })
  price: number;

  @Column({
    type: 'enum',
    enum: CourseStatus,
    default: CourseStatus.DRAFT,
  })
  status: CourseStatus;

  @ManyToOne(() => User, (user) => user.courses, {
    onDelete: 'CASCADE',
  })
  teacher: User;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
