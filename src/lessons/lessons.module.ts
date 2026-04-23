import { Module } from '@nestjs/common';
import { LessonsService } from './lessons.service';
import { LessonsController } from './lessons.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Lesson } from './entities/lesson.entity';
import { Course } from 'src/courses/entities/course.entity';
import { AuthModule } from 'src/auth/auth.module';
import { Enrollment } from 'src/enrollments/entities/enrollment.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Lesson, Course, Enrollment]), AuthModule],
  controllers: [LessonsController],
  providers: [LessonsService],
})
export class LessonsModule {}
