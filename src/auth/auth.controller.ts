import { Controller, Get, Post, Body, UseGuards, Res } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateAuthDto } from './dto/create-auth.dto';
import { AuthGuard } from './auth.guard';
import type { Response } from 'express';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // 🔹 Register endpoint, XSS sanitization bilan
  @Post('register')
  register(@Body() createAuthDto: CreateAuthDto) {
    return this.authService.create(createAuthDto);
  }

  // 🔹 Login endpoint, XSS sanitization bilan
  @Post('login')
  login(
    @Body() loginDto: { username: string; password: string },
    @Res() res: Response,
  ) {
    return this.authService.login(loginDto, res);
  }

  @Post('logout')
  @UseGuards(AuthGuard)
  logout(@Res() res: Response) {
    const result = this.authService.logout();
    res.clearCookie('refresh_token');
    return res.status(200).json(result);
  }
}
