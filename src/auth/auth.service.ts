import {
  ConflictException,
  Injectable,
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
