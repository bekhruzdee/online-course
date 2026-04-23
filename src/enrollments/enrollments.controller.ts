import { Controller, Post, Body, UseGuards, Req, Get } from '@nestjs/common';
import { EnrollmentsService } from './enrollments.service';
import { CreateEnrollmentDto } from './dto/create-enrollment.dto';
import { AuthGuard } from 'src/auth/auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { Role } from 'src/common/enums/role.enum';
import { AssignEnrollmentDto } from './dto/assign-enrollment.dto';

@Controller('enrollments')
@UseGuards(AuthGuard, RolesGuard)
export class EnrollmentsController {
  constructor(private readonly service: EnrollmentsService) {}

  @Roles(Role.STUDENT)
  @Post()
  enroll(@Req() req, @Body() dto: CreateEnrollmentDto) {
    return this.service.enroll(req.user, dto);
  }

  @Roles(Role.ADMIN)
  @Post('assign')
  assign(@Body() dto: AssignEnrollmentDto) {
    return this.service.assign(dto);
  }

  @Roles(Role.ADMIN)
  @Get()
  findAll() {
    return this.service.findAll();
  }

  @Roles(Role.STUDENT)
  @Get('my-courses')
  myCourses(@Req() req) {
    return this.service.myCourses(req.user);
  }
}
