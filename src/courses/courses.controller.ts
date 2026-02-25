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
import { Roles} from 'src/common/guards/role.guard';

@UseGuards(AuthGuard)
@Controller('courses')
export class CoursesController {
  constructor(private readonly coursesService: CoursesService) {}

  @Roles('teacher', 'admin')
  @Post()
  create(@Body() dto: CreateCourseDto, @Req() req) {
    return this.coursesService.create(dto, req.user);
  }

  @Get()
  findAll(@Query() query: SearchCourseDto) {
    return this.coursesService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id') id: number) {
    return this.coursesService.findOne(+id);
  }

  @Roles('teacher', 'admin')
  @Patch(':id')
  update(@Param('id') id: number, @Body() dto: UpdateCourseDto, @Req() req) {
    return this.coursesService.update(+id, dto, req.user);
  }

  @Roles('teacher', 'admin')
  @Delete(':id')
  remove(@Param('id') id: number, @Req() req) {
    return this.coursesService.remove(+id, req.user);
  }

  @Roles('teacher', 'admin')
  @Patch(':id/publish')
  publish(@Param('id') id: number, @Req() req) {
    return this.coursesService.publish(+id, req.user);
  }
}
