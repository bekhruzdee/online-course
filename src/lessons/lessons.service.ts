import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Lesson } from './entities/lesson.entity';
import { CreateLessonDto } from './dto/create-lesson.dto';
import { UpdateLessonDto } from './dto/update-lesson.dto';
import { Course } from 'src/courses/entities/course.entity';
import { Role } from 'src/common/enums/role.enum';
import { User } from 'src/users/entities/user.entity';
import { Enrollment } from 'src/enrollments/entities/enrollment.entity';

@Injectable()
export class LessonsService {
  constructor(
    @InjectRepository(Lesson)
    private readonly lessonRepository: Repository<Lesson>,
    @InjectRepository(Course)
    private readonly courseRepository: Repository<Course>,
    @InjectRepository(Enrollment)
    private readonly enrollmentRepository: Repository<Enrollment>,
  ) {}

  async create(dto: CreateLessonDto, user: any) {
    const course = await this.courseRepository.findOne({
      where: { id: dto.courseId },
      relations: ['teacher'],
    });
    if (!course) throw new NotFoundException('Course not found');

    if (user.role === Role.TEACHER && course.teacher.id !== user.id) {
      throw new ForbiddenException(
        'You can only add lessons to your own courses',
      );
    }

    const lesson = this.lessonRepository.create({
      title: dto.title,
      contentUrl: dto.contentUrl,
      course,
    });

    return this.lessonRepository.save(lesson);
  }

  async findAllByCourse(courseId: string, user: User) {
    const course = await this.courseRepository.findOne({
      where: { id: courseId },
      relations: ['teacher'],
    });

    if (!course) {
      throw new NotFoundException('Course not found');
    }

    if (user.role === Role.TEACHER && course.teacher.id !== user.id) {
      throw new ForbiddenException(
        'You can only view lessons from your own courses',
      );
    }

    if (user.role === Role.STUDENT) {
      const enrollment = await this.enrollmentRepository.findOne({
        where: {
          user: { id: user.id },
          course: { id: courseId },
        },
      });

      if (!enrollment) {
        throw new ForbiddenException(
          'You can only view lessons from courses you enrolled in',
        );
      }
    }

    return this.lessonRepository.find({
      where: { course: { id: courseId } },
      order: { id: 'ASC' },
    });
  }

  async findMyLessons(user: User) {
    const where =
      user.role === Role.ADMIN
        ? {}
        : {
            course: {
              teacher: {
                id: user.id,
              },
            },
          };

    const lessons = await this.lessonRepository.find({
      where,
      relations: ['course', 'course.teacher'],
      order: {
        createdAt: 'DESC',
      },
    });

    return {
      success: true,
      message: 'Lessons retrieved successfully ✅',
      data: lessons,
    };
  }

  async findOne(id: string) {
    const lesson = await this.lessonRepository.findOne({
      where: { id },
      relations: ['course', 'course.teacher'],
    });
    if (!lesson) throw new NotFoundException('Lesson not found');
    return lesson;
  }

  async update(id: string, dto: UpdateLessonDto, user: any) {
    const lesson = await this.lessonRepository.findOne({
      where: { id },
      relations: ['course', 'course.teacher'],
    });
    if (!lesson) throw new NotFoundException('Lesson not found');

    if (user.role === Role.TEACHER && lesson.course.teacher.id !== user.id) {
      throw new ForbiddenException(
        'You can only update lessons of your own courses',
      );
    }

    if (dto.courseId) {
      const nextCourse = await this.courseRepository.findOne({
        where: { id: dto.courseId },
        relations: ['teacher'],
      });

      if (!nextCourse) {
        throw new NotFoundException('Course not found');
      }

      if (user.role === Role.TEACHER && nextCourse.teacher.id !== user.id) {
        throw new ForbiddenException(
          'You can only move lessons to your own courses',
        );
      }

      lesson.course = nextCourse;
    }

    Object.assign(lesson, dto);
    return this.lessonRepository.save(lesson);
  }

  async remove(id: string, user: any) {
    const lesson = await this.lessonRepository.findOne({
      where: { id },
      relations: ['course', 'course.teacher'],
    });
    if (!lesson) throw new NotFoundException('Lesson not found');

    if (user.role === Role.TEACHER && lesson.course.teacher.id !== user.id) {
      throw new ForbiddenException(
        'You can only remove lessons of your own courses',
      );
    }

    return this.lessonRepository.remove(lesson);
  }
}
