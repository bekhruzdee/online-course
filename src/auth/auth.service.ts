import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { randomUUID } from 'crypto';
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

  // In-memory refresh token store: userId -> current refresh token jti
  // Note: for production use a persistent store (DB/Redis) instead.
  private refreshTokenStore = new Map<string, string>();

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

    if (!user.password) {
      throw new UnauthorizedException('This account uses social login ❌');
    }

    const checkPass = await bcrypt.compare(loginDto.password, user.password);

    if (!checkPass) {
      throw new UnauthorizedException('Invalid credentials ❌');
    }

    const payload = {
      id: user.id,
      role: user.role,
    };

    // Create rotation-aware refresh token
    const jti = randomUUID();
    this.refreshTokenStore.set(user.id, jti);

    const accessToken = this.jwtService.sign(payload, {
      expiresIn: '15m',
    });

    const refreshToken = this.jwtService.sign({ ...payload, jti }, {
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

  async refresh(refreshToken: string, res: Response) {
    if (!refreshToken) throw new UnauthorizedException('Refresh token missing');

    let payload: any;
    try {
      payload = await this.jwtService.verifyAsync(refreshToken);
    } catch (err) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    const { id, jti } = payload;
    const currentJti = this.refreshTokenStore.get(id);
    if (!currentJti || currentJti !== jti) {
      throw new UnauthorizedException('Refresh token revoked');
    }

    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) throw new UnauthorizedException('User not found');

    // Rotate refresh token
    const newJti = randomUUID();
    this.refreshTokenStore.set(user.id, newJti);

    const newAccess = this.jwtService.sign({ id: user.id, role: user.role }, { expiresIn: '15m' });
    const newRefresh = this.jwtService.sign({ id: user.id, role: user.role, jti: newJti }, { expiresIn: '7d' });

    res.cookie('refresh_token', newRefresh, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    const { password, ...userData } = user;
    return { user: userData, access_token: newAccess };
  }

  async issueTokensForUser(user: User, res: Response) {
    const payload = { id: user.id, role: user.role };

    const jti = randomUUID();
    this.refreshTokenStore.set(user.id, jti);

    const accessToken = this.jwtService.sign(payload, { expiresIn: '15m' });
    const refreshToken = this.jwtService.sign({ ...payload, jti }, { expiresIn: '7d' });

    res.cookie('refresh_token', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    const { password, ...userData } = user;
    return { user: userData, access_token: accessToken };
  }

  revokeRefreshForUser(userId: string) {
    this.refreshTokenStore.delete(userId);
  }

  async getAllMyData(payload: any) {
    return this.userRepository.findOne({
      where: { id: payload.id },
    });
  }

  async validateGoogleUser(profile: any) {
    const { id, emails, displayName } = profile;
    const email = emails[0].value;
    const user = await this.userRepository.findOne({ where: { username: email } });

    if (!user) {
      throw new UnauthorizedException(
        'Account is not provisioned by admin for Google login ❌',
      );
    }

    // Return the user (controller will issue tokens and set cookies)
    return user;
  }
}
