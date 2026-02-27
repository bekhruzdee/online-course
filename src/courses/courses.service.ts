// import { Injectable, NotFoundException } from '@nestjs/common';
// import { InjectRepository } from '@nestjs/typeorm';
// import { Repository, ILike } from 'typeorm';
// import { Course, CourseStatus } from './entities/course.entity';
// import { CreateCourseDto } from './dto/create-course.dto';
// import { UpdateCourseDto } from './dto/update-course.dto';
// import { SearchCourseDto } from './dto/search-course.dto';
// import { User } from 'src/users/entities/user.entity';

// @Injectable()
// export class CoursesService {
//   constructor(
//     @InjectRepository(Course)
//     private courseRepository: Repository<Course>,
//   ) {}

//   async create(dto: CreateCourseDto, teacher: User) {
//     const course = this.courseRepository.create({
//       ...dto,
//       teacher,
//     });

//     const saved = await this.courseRepository.save(course);

//     return {
//       success: true,
//       message: 'Course created successfully ✅',
//       data: saved,
//     };
//   }

//   async findAll() {
//     const courses = await this.courseRepository.find({});

//     return {
//       success: true,
//       message: 'All courses retrieved successfully ✅',
//       data: courses,
//     };
//   }

//   async findOne(id: number) {
//     const course = await this.courseRepository.findOne({
//       where: { id },
//     });
//     if (!course) throw new NotFoundException('Course not found ❌');

//     return {
//       success: true,
//       message: 'Course retrieved successfully ✅',
//       data: course,
//     };
//   }

//   async findByTitle(query: SearchCourseDto) {
//     const { title } = query;

//     const where: any = {};

//     if (title) {
//       where.title = ILike(`%${title}%`);
//     }

//     const courses = await this.courseRepository.find({
//       where,
//     });

//     return {
//       success: true,
//       message: 'Courses retrieved successfully ✅',
//       data: courses,
//     };
//   }
//   async update(id: number, dto: UpdateCourseDto, user: User) {
//     const course = await this.courseRepository.findOne({ where: { id } });
//     if (!course) throw new NotFoundException('Course not found ❌');

//     Object.assign(course, dto);
//     const updated = await this.courseRepository.save(course);

//     return {
//       success: true,
//       message: 'Course updated successfully ✅',
//       data: updated,
//     };
//   }

//   async remove(id: number, user: User) {
//     const course = await this.courseRepository.findOne({ where: { id } });
//     if (!course) throw new NotFoundException('Course not found ❌');

//     await this.courseRepository.remove(course);

//     return {
//       success: true,
//       message: 'Course deleted successfully ✅',
//     };
//   }

//   async publish(id: number, user: User) {
//     const course = await this.courseRepository.findOne({
//       where: { id },
//       relations: ['teacher'],
//     });
//     if (!course) throw new NotFoundException('Course not found ❌');

//     course.status = CourseStatus.PUBLISHED;
//     await this.courseRepository.save(course);

//     return {
//       success: true,
//       message: 'Course published successfully ✅',
//     };
//   }
// }

import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike, FindOptionsWhere } from 'typeorm';
import { Course, CourseStatus } from './entities/course.entity';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
import { SearchCourseDto } from './dto/search-course.dto';
import { User } from 'src/users/entities/user.entity';
import { Role } from 'src/common/enums/role.enum';

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

  async findAll() {
    const courses = await this.courseRepository.find({
      relations: ['teacher'],
      select: {
        id: true,
        title: true,
        description: true,
        price: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        teacher: {
          id: true,
          username: true,
          role: true,
          createdAt: true,
          updatedAt: true,
        },
      },
    });

    return {
      success: true,
      message: 'All courses retrieved successfully ✅',
      data: courses,
    };
  }

  async findByTitle(query: SearchCourseDto) {
    const { title } = query;
    const where: FindOptionsWhere<Course> = {};

    if (title) {
      where.title = ILike(`%${title}%`);
    }

    const courses = await this.courseRepository.find({
      where,
      relations: ['teacher'],
      select: {
        id: true,
        title: true,
        description: true,
        price: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        teacher: {
          id: true,
          username: true,
          role: true,
          createdAt: true,
          updatedAt: true,
        },
      },
    });

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
      select: {
        id: true,
        title: true,
        description: true,
        price: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        teacher: {
          id: true,
          username: true,
          role: true,
          createdAt: true,
          updatedAt: true,
        },
      },
    });

    if (!course) throw new NotFoundException('Course not found ❌');

    return {
      success: true,
      message: 'Course retrieved successfully ✅',
      data: course,
    };
  }

  async update(id: number, dto: UpdateCourseDto, user: User) {
    const course = await this.courseRepository.findOne({
      where: { id },
      relations: ['teacher'],
    });

    if (!course) throw new NotFoundException('Course not found ❌');

    const isOwner = course.teacher.id === user.id;
    const isAdmin = user.role === Role.ADMIN;

    if (!isOwner && !isAdmin)
      throw new ForbiddenException(
        'You do not have permission to update this course ❌',
      );

    Object.assign(course, dto);
    const updated = await this.courseRepository.save(course);

    return {
      success: true,
      message: 'Course updated successfully ✅',
      data: updated,
    };
  }

  async remove(id: number, user: User) {
    const course = await this.courseRepository.findOne({
      where: { id },
      relations: ['teacher'],
    });

    if (!course) throw new NotFoundException('Course not found ❌');

    const isOwner = course.teacher.id === user.id;
    const isAdmin = user.role === Role.ADMIN;

    if (!isOwner && !isAdmin)
      throw new ForbiddenException(
        'You do not have permission to delete this course ❌',
      );

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

    if (user.role !== Role.ADMIN)
      throw new ForbiddenException('Only admin can publish this course ❌');

    course.status = CourseStatus.PUBLISHED;
    await this.courseRepository.save(course);

    return {
      success: true,
      message: 'Course published successfully ✅',
      data: course,
    };
  }
}
