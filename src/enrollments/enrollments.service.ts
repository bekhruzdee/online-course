import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Enrollment } from './entities/enrollment.entity';
import { Course } from 'src/courses/entities/course.entity';
import { User } from 'src/users/entities/user.entity';
import { CreateEnrollmentDto } from './dto/create-enrollment.dto';
import { AssignEnrollmentDto } from './dto/assign-enrollment.dto';
import { Role } from 'src/common/enums/role.enum';

@Injectable()
export class EnrollmentsService {
  constructor(
    @InjectRepository(Enrollment)
    private enrollmentRepo: Repository<Enrollment>,

    @InjectRepository(Course)
    private courseRepo: Repository<Course>,

    @InjectRepository(User)
    private userRepo: Repository<User>,
  ) {}

  private async enrollToCourse(user: User, course: Course) {
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

  async enroll(user: User, dto: CreateEnrollmentDto) {
    const course = await this.courseRepo.findOne({
      where: { id: dto.courseId },
    });

    if (!course) {
      throw new NotFoundException('Course not found');
    }

    return this.enrollToCourse(user, course);
  }

  async assign(dto: AssignEnrollmentDto) {
    const [user, course] = await Promise.all([
      this.userRepo.findOne({ where: { id: dto.userId } }),
      this.courseRepo.findOne({ where: { id: dto.courseId } }),
    ]);

    if (!user) {
      throw new NotFoundException('Student not found');
    }

    if (user.role !== Role.STUDENT) {
      throw new BadRequestException('Only student users can be enrolled');
    }

    if (!course) {
      throw new NotFoundException('Course not found');
    }

    const enrollment = await this.enrollToCourse(user, course);

    return {
      success: true,
      message: 'Student enrolled by admin successfully',
      data: enrollment,
    };
  }

  async findAll() {
    const enrollments = await this.enrollmentRepo.find({
      relations: ['user', 'course', 'course.teacher'],
      order: {
        enrolledAt: 'ASC',
      },
    });

    return {
      success: true,
      message: 'Enrollments retrieved successfully',
      data: enrollments,
    };
  }

  async myCourses(user: User) {
    const enrollments = await this.enrollmentRepo.find({
      where: { user: { id: user.id } },
      relations: ['course'],
      order: {
        enrolledAt: 'ASC',
      },
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
