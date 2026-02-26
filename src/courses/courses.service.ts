import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike } from 'typeorm';
import { Course, CourseStatus } from './entities/course.entity';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
import { SearchCourseDto } from './dto/search-course.dto';
import { User } from 'src/users/entities/user.entity';

@Injectable()
export class CoursesService {
  constructor(
    @InjectRepository(Course)
    private courseRepository: Repository<Course>,
  ) {}

  async create(dto: CreateCourseDto, teacher: User) {
    const course = this.courseRepository.create({
      ...dto,
      teacher,
    });

    const saved = await this.courseRepository.save(course);

    return {
      success: true,
      message: 'Course created successfully ✅',
      data: saved,
    };
  }

  async findAll(query: SearchCourseDto) {
    const { title, status } = query;

    const where: any = {};

    if (title) {
      where.title = ILike(`%${title}%`);
    }

    if (status) {
      where.status = status;
    }

    const courses = await this.courseRepository.find({ where });

    return {
      success: true,
      message: 'Courses retrieved successfully ✅',
      data: courses,
    };
  }

  async findOne(id: number) {
    const course = await this.courseRepository.findOne({
      where: { id },
      relations: ['teacher'],
    });
    if (!course) throw new NotFoundException('Course not found ❌');

    return {
      success: true,
      message: 'Course retrieved successfully ✅',
      data: course,
    };
  }
  async update(id: number, dto: UpdateCourseDto, user: User) {
    const course = await this.courseRepository.findOne({ where: { id } });
    if (!course) throw new NotFoundException('Course not found ❌');

    Object.assign(course, dto);
    const updated = await this.courseRepository.save(course);

    return {
      success: true,
      message: 'Course updated successfully ✅',
      data: updated,
    };
  }

  async remove(id: number, user: User) {
    const course = await this.courseRepository.findOne({ where: { id } });
    if (!course) throw new NotFoundException('Course not found ❌');

    await this.courseRepository.remove(course);

    return {
      success: true,
      message: 'Course deleted successfully ✅',
    };
  }

  async publish(id: number, user: User) {
    const course = await this.courseRepository.findOne({
      where: { id },
      relations: ['teacher'],
    });
    if (!course) throw new NotFoundException('Course not found ❌');

    course.status = CourseStatus.PUBLISHED;
    await this.courseRepository.save(course);

    return {
      success: true,
      message: 'Course published successfully ✅',
    };
  }
}
