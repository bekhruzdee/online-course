import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Param,
  Body,
  Req,
  UseGuards,
  ParseUUIDPipe,
  Query,
} from '@nestjs/common';
import { LessonsService } from './lessons.service';
import { CreateLessonDto } from './dto/create-lesson.dto';
import { UpdateLessonDto } from './dto/update-lesson.dto';
import { AuthGuard } from 'src/auth/auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { Role } from 'src/common/enums/role.enum';

@UseGuards(AuthGuard, RolesGuard)
@Controller('lessons')
export class LessonsController {
  constructor(private readonly lessonsService: LessonsService) {}

  @Roles(Role.TEACHER, Role.ADMIN)
  @Post()
  create(@Body() dto: CreateLessonDto, @Req() req) {
    return this.lessonsService.create(dto, req.user);
  }

  @Roles(Role.TEACHER, Role.ADMIN)
  @Get('course/:courseId')
  findAllByCourse(@Param('courseId', ParseUUIDPipe) courseId: string) {
    return this.lessonsService.findAllByCourse(courseId);
  }

  @Roles(Role.TEACHER, Role.ADMIN)
  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateLessonDto,
    @Req() req,
  ) {
    return this.lessonsService.update(id, dto, req.user);
  }

  @Roles(Role.TEACHER, Role.ADMIN)
  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string, @Req() req) {
    return this.lessonsService.remove(id, req.user);
  }

  @Roles(Role.TEACHER, Role.ADMIN)
  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.lessonsService.findOne(id);
  }
}
