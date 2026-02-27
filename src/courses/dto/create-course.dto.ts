// import {
//   IsNotEmpty,
//   IsString,
//   IsNumber,
//   Min,
//   IsOptional,
// } from 'class-validator';
// import { Type } from 'class-transformer';

// export class CreateCourseDto {
//   @IsNotEmpty()
//   @IsString()
//   title: string;

//   @IsNotEmpty()
//   @IsString()
//   description: string;

//   @IsOptional()
//   @Type(() => Number)
//   @IsNumber()
//   @Min(0)
//   price?: number;
// }

import {
  IsNotEmpty,
  IsString,
  IsNumber,
  Min,
  IsOptional,
  MaxLength,
} from 'class-validator';
import { Type, Transform } from 'class-transformer';

export class CreateCourseDto {
  @IsNotEmpty()
  @IsString()
  @MaxLength(150)
  @Transform(({ value }) => value?.trim())
  title: string;

  @IsNotEmpty()
  @IsString()
  @Transform(({ value }) => value?.trim())
  description: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  price?: number;
}
