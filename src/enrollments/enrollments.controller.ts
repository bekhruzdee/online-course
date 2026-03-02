import { Controller, Post, Body, UseGuards, Req, Get } from '@nestjs/common';
import { EnrollmentsService } from './enrollments.service';
import { CreateEnrollmentDto } from './dto/create-enrollment.dto';
import { AuthGuard } from 'src/auth/auth.guard';

@Controller('enrollments')
@UseGuards(AuthGuard)
export class EnrollmentsController {
  constructor(private readonly service: EnrollmentsService) {}

  @Post()
  enroll(@Req() req, @Body() dto: CreateEnrollmentDto) {
    return this.service.enroll(req.user, dto);
  }

  @Get('my-courses')
  myCourses(@Req() req) {
    return this.service.myCourses(req.user);
  }
}
