import { 
  IsNotEmpty, 
  IsInt, 
  IsString, 
  IsUrl, 
  Min, 
  MaxLength 
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateLessonDto {

  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  title: string;

  @IsString()
  @IsNotEmpty()
  @IsUrl()
  @MaxLength(500)
  contentUrl: string;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  courseId: number;
}