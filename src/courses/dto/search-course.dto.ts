// import { IsOptional, IsString, IsEnum, MaxLength } from 'class-validator';
// import { CourseStatus } from '../entities/course.entity';
// import { Transform } from 'class-transformer';

// export class SearchCourseDto {
//   @IsOptional()
//   @IsString()
//   @MaxLength(100)
//   @Transform(({ value }) => value?.trim())
//   title?: string;

//   @IsOptional()
//   @IsEnum(CourseStatus)
//   status?: CourseStatus;
// }

import {
  IsOptional,
  IsString,
  IsEnum,
  IsInt,
  Min,
  MaxLength,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { CourseStatus } from '../entities/course.entity';

export class SearchCourseDto {
  @IsOptional()
  @IsString()
  @MaxLength(100)
  @Transform(({ value }) => value?.trim())
  title?: string;

  @IsOptional()
  @IsEnum(CourseStatus)
  status?: CourseStatus;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number = 10;
}
