// import { IsOptional, IsString, MinLength } from 'class-validator';

// export class UpdateUserDto {
//   @IsOptional()
//   @IsString()
//   @MinLength(3)
//   username?: string;

//   @IsOptional()
//   @IsString()
//   @MinLength(6)
//   password?: string;

//   @IsOptional()
//   @IsString()
//   roleId?: number;
// }

import { IsOptional, IsString, MinLength, IsEnum } from 'class-validator';
import { Role } from 'src/common/enums/role.enum';

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  @MinLength(3)
  username?: string;

  @IsOptional()
  @IsString()
  @MinLength(6)
  password?: string;

  @IsOptional()
  @IsEnum(Role)
  role?: Role;
}