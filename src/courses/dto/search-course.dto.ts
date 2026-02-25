import { IsOptional, IsString, IsEnum } from 'class-validator';
import { CourseStatus } from '../entities/course.entity';

export class SearchCourseDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsEnum(CourseStatus)
  status?: CourseStatus;
}