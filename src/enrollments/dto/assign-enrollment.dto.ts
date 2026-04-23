import { IsUUID, IsNotEmpty } from 'class-validator';

export class AssignEnrollmentDto {
  @IsUUID()
  @IsNotEmpty()
  userId!: string;

  @IsUUID()
  @IsNotEmpty()
  courseId!: string;
}
