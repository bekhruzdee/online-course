import { IsEnum, IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';
import { Transform } from 'class-transformer';
import sanitizeHtml from 'sanitize-html';
import { Role } from 'src/common/enums/role.enum';

export class CreateUserDto {
  @IsNotEmpty()
  @IsString()
  @MinLength(3)
  @Transform(({ value }) => sanitizeHtml(value))
  username: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(6)
  password: string;

  @IsEnum(Role)
  @IsOptional()
  role?: Role;
}
