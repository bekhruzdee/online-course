import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Enrollment } from './entities/enrollment.entity';
import { Course } from 'src/courses/entities/course.entity';
import { User } from 'src/users/entities/user.entity';
import { CreateEnrollmentDto } from './dto/create-enrollment.dto';

@Injectable()
export class EnrollmentsService {
  constructor(
    @InjectRepository(Enrollment)
    private enrollmentRepo: Repository<Enrollment>,

    @InjectRepository(Course)
    private courseRepo: Repository<Course>,
  ) {}

  async enroll(user: User, dto: CreateEnrollmentDto) {
    const course = await this.courseRepo.findOne({
      where: { id: dto.courseId },
    });

    if (!course) {
      throw new NotFoundException('Course not found');
    }

    const existing = await this.enrollmentRepo.findOne({
      where: {
        user: { id: user.id },
        course: { id: course.id },
      },
    });

    if (existing) {
      throw new ConflictException('Already enrolled');
    }

    const enrollment = this.enrollmentRepo.create({
      user,
      course,
    });

    return this.enrollmentRepo.save(enrollment);
  }

  async myCourses(user: User) {
    const enrollments = await this.enrollmentRepo.find({
      where: { user: { id: user.id } },
      relations: ['course'],
    });

    if (enrollments.length === 0) {
      return {
        success: true,
        message: 'You are not enrolled in any courses yet',
        data: [],
      };
    }

    return {
      success: true,
      message: 'Your enrolled courses retrieved successfully',
      data: enrollments,
    };
  }
}
