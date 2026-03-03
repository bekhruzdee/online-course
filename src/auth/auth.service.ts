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
      role: Role.STUDENT,
    });

    await this.userRepository.save(user);

    return {
      success: true,
      message: 'You are registered ✅',
    };
  }

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
      role: user.role,
    };

    const accessToken = this.jwtService.sign(payload, {
      expiresIn: '15m',
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
    return {
      user: userData,
      access_token: accessToken,
    };
  }

  async getAllMyData(payload: any) {
    return this.userRepository.findOne({
      where: { id: payload.id },
    });
  }


async validateGoogleUser(profile: any) {
  const { id, emails, displayName } = profile;
  const email = emails[0].value;

  let user = await this.userRepository.findOne({
    where: { username: email },
  });

  if (!user) {
    user = this.userRepository.create({
      username: email,
      provider: 'google',
      providerId: id,
      role: Role.STUDENT,
      // password optional bo‘lgani uchun null berish mumkin
      password: undefined,
    });
    await this.userRepository.save(user);
  }

  const payload = { id: user.id, role: user.role };
  const accessToken = this.jwtService.sign(payload, {
    secret: process.env.JWT_SECRET,
    expiresIn: '15m', // string bilan ishlaydi
  });

  return { user, accessToken };
}
}
