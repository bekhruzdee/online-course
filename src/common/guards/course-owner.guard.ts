import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Course } from 'src/courses/entities/course.entity';
import { Repository } from 'typeorm';
import { Role } from '../enums/role.enum';

@Injectable()
export class CourseOwnerGuard implements CanActivate {
  constructor(
    @InjectRepository(Course)
    private readonly courseRepository: Repository<Course>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const id = +request.params.id;

    const course = await this.courseRepository.findOne({
      where: { id },
      relations: ['teacher'],
    });

    if (!course) throw new NotFoundException('Course not found ❌');

    if (user.role === Role.ADMIN) {
      request.course = course;
      return true;
    }

    if (user.role === Role.TEACHER && course.teacher.id === user.id) {
      request.course = course;
      return true;
    }

    throw new ForbiddenException('You can access only your own course ❌');
  }
}
