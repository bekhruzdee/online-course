import {
  IsNotEmpty,
  IsString,
  IsUrl,
  IsUUID,
  MaxLength,
} from 'class-validator';

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

  @IsUUID()
  @IsNotEmpty()
  courseId: string;
}
