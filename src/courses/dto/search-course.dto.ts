import { IsOptional, IsString, IsEnum, MaxLength } from 'class-validator';
import { CourseStatus } from '../entities/course.entity';
import { Transform } from 'class-transformer';

export class SearchCourseDto {
  @IsOptional()
  @IsString()
  @MaxLength(100)
  @Transform(({ value }) => value?.trim())
  title?: string;

  @IsOptional()
  @IsEnum(CourseStatus)
  status?: CourseStatus;
}
