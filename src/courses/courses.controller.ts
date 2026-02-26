import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { CoursesService } from './courses.service';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
import { SearchCourseDto } from './dto/search-course.dto';
import { AuthGuard } from 'src/auth/auth.guard';
import { CourseOwnerGuard } from 'src/common/guards/course-owner.guard';
import { Role } from 'src/common/enums/role.enum';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';

@UseGuards(AuthGuard, RolesGuard)
@Controller('courses')
export class CoursesController {
  constructor(private readonly coursesService: CoursesService) {}

  @Roles(Role.TEACHER, Role.ADMIN)
  @Post()
  create(@Body() dto: CreateCourseDto, @Req() req) {
    return this.coursesService.create(dto, req.user);
  }

  @Roles(Role.ADMIN)
  @Get()
  findAll(@Query() query: SearchCourseDto) {
    return this.coursesService.findAll(query);
  }

  @Roles(Role.TEACHER, Role.ADMIN)
  @Patch(':id')
  update(@Param('id') id: number, @Body() dto: UpdateCourseDto, @Req() req) {
    return this.coursesService.update(+id, dto, req.user);
  }

  @Roles(Role.TEACHER, Role.ADMIN)
  @Delete(':id')
  remove(@Param('id') id: number, @Req() req) {
    return this.coursesService.remove(+id, req.user);
  }

  @Roles(Role.TEACHER, Role.ADMIN)
  @UseGuards(CourseOwnerGuard)
  @Patch(':id/publish')
  publish(@Param('id') id: number, @Req() req) {
    return this.coursesService.publish(+id, req.user);
  }
}
