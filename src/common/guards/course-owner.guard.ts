import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Course } from 'src/courses/entities/course.entity';
import { Repository } from 'typeorm';

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

    if (!course) {
      throw new NotFoundException('Course not found ❌');
    }

    const role = typeof user.role === 'string' ? user.role : user.role?.name;
    if (role === 'admin') {
      request.course = course;
      return true;
    }

    if (course.teacher.id !== user.id) {
      throw new ForbiddenException('You can access only your own course ❌');
    }

    request.course = course;
    return true;
  }
}
