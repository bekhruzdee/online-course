// import {
//   ConflictException,
//   Injectable,
//   NotFoundException,
// } from '@nestjs/common';
// import { CreateAuthDto } from './dto/create-auth.dto';
// import { InjectRepository } from '@nestjs/typeorm';
// import { User } from 'src/users/entities/user.entity';
// import { Role } from 'src/roles/entities/role.entity';
// import { Repository } from 'typeorm';
// import * as bcrypt from 'bcrypt';
// import { JwtService } from '@nestjs/jwt';
// import { Response } from 'express';

// @Injectable()
// export class AuthService {
//   constructor(
//     @InjectRepository(User)
//     private readonly userRepository: Repository<User>,

//     @InjectRepository(Role)
//     private readonly roleRepository: Repository<Role>,

//     private jwtService: JwtService,
//   ) {}
//   async create(createAuthDto: CreateAuthDto) {
//     const existingUser = await this.userRepository.findOne({
//       where: { username: createAuthDto.username },
//     });
//     if (existingUser) throw new ConflictException('Username already exists❌');

//     const role = createAuthDto.roleId
//       ? await this.roleRepository.findOne({
//           where: { id: createAuthDto.roleId },
//           relations: ['permissions'],
//         })
//       : await this.roleRepository.findOne({
//           where: { name: 'student' },
//           relations: ['permissions'],
//         });

//     if (!role) throw new NotFoundException('Role not found❌');

//     const user = this.userRepository.create({
//       username: createAuthDto.username,
//       password: await bcrypt.hash(createAuthDto.password, 12),
//       role,
//     });

//     await this.userRepository.save(user);
//     return 'You are registered✅';
//   }

//   async login(loginDto: { username: string; password: string }, res: Response) {
//     const user = await this.userRepository.findOne({
//       where: { username: loginDto.username },
//       relations: ['role', 'role.permissions'],
//     });
//     if (!user) throw new NotFoundException('User Not Found ⚠️');

//     const checkPass = await bcrypt.compare(loginDto.password, user.password);
//     if (!checkPass) throw new NotFoundException('Password Error ⚠️');
//     if (!user.role) throw new NotFoundException('User role not assigned⚠️');

//     const payload = {
//       id: user.id,
//       role: user.role.name,
//       permissions: user.role.permissions.map((p) => p.name),
//     };

//     const accessToken = this.jwtService.sign(payload, { expiresIn: '1d' });
//     const refreshToken = this.jwtService.sign(payload, { expiresIn: '7d' });

//     res.cookie('refresh_token', refreshToken, {
//       httpOnly: true,
//       secure: process.env.NODE_ENV === 'production',
//       sameSite: 'strict',
//       maxAge: 7 * 24 * 60 * 60 * 1000,
//     });

//     const { password, ...userData } = user;
//     return res.json({ userData, access_token: accessToken });
//   }

//   // 🔹 Logout
//   logout(): { message: string } {
//     return { message: 'Logout successfully✅' };
//   }

//   // 🔹 Get user by payload id
//   async getAllMyData(payload: any) {
//     const user = await this.userRepository.findOne({
//       where: { id: payload.id },
//       relations: ['role', 'role.permissions'],
//     });
//     return user;
//   }
// }

import {
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateAuthDto } from './dto/create-auth.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/users/entities/user.entity';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { Response } from 'express';
import { Role } from 'src/common/enums/role.enum';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private jwtService: JwtService,
  ) {}

  // 🔹 REGISTER
  async create(createAuthDto: CreateAuthDto) {
    const existingUser = await this.userRepository.findOne({
      where: { username: createAuthDto.username },
    });

    if (existingUser) {
      throw new ConflictException('Username already exists ❌');
    }

    const user = this.userRepository.create({
      username: createAuthDto.username,
      password: await bcrypt.hash(createAuthDto.password, 12),
      role: Role.STUDENT, // default role
    });

    await this.userRepository.save(user);

    return {
      success: true,
      message: 'You are registered ✅',
    };
  }

  // 🔹 LOGIN
  async login(loginDto: { username: string; password: string }, res: Response) {
    const user = await this.userRepository.findOne({
      where: { username: loginDto.username },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials ❌');
    }

    const checkPass = await bcrypt.compare(loginDto.password, user.password);

    if (!checkPass) {
      throw new UnauthorizedException('Invalid credentials ❌');
    }

    const payload = {
      id: user.id,
      role: user.role, // enum
    };

    const accessToken = this.jwtService.sign(payload, {
      expiresIn: '1d',
    });

    const refreshToken = this.jwtService.sign(payload, {
      expiresIn: '7d',
    });

    res.cookie('refresh_token', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    const { password, ...userData } = user;

    return res.json({
      user: userData,
      access_token: accessToken,
    });
  }

  // 🔹 LOGOUT
  logout(): { message: string } {
    return { message: 'Logout successfully ✅' };
  }

  // 🔹 GET CURRENT USER
  async getAllMyData(payload: any) {
    return this.userRepository.findOne({
      where: { id: payload.id },
    });
  }
}
