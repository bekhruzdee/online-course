import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  JoinColumn,
} from 'typeorm';
import { Course } from 'src/courses/entities/course.entity';

@Entity('lessons')
export class Lesson {
  @PrimaryGeneratedColumn()
  id: number;

  @Index()
  @Column({ length: 150 })
  title: string;

  @Column({ length: 500 })
  contentUrl: string;

  @ManyToOne(() => Course, (course) => course.lessons, {
    onDelete: 'CASCADE',
    nullable: false,
  })
  @JoinColumn({ name: 'course_id' })
  course: Course;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
