import {
  Controller,
  Post,
  Body,
  UseGuards,
  Res,
  Get,
  Req,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateAuthDto } from './dto/create-auth.dto';
import { AuthGuard } from '../common/guards/auth.guard';
import type { Response } from 'express';
import { GoogleAuthGuard } from './google.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  register(@Body() createAuthDto: CreateAuthDto) {
    return this.authService.create(createAuthDto);
  }

  @Post('login')
  login(
    @Body() loginDto: { username: string; password: string },
    @Res({ passthrough: true }) res: Response,
  ) {
    return this.authService.login(loginDto, res);
  }

  @Post('logout')
  @UseGuards(AuthGuard)
  logout(@Req() req: any, @Res({ passthrough: true }) res: Response) {
    this.authService.revokeRefreshForUser(req.user.id);
    res.clearCookie('refresh_token');

    return {
      message: 'Logout successfully ✅',
    };
  }

  @Post('refresh')
  async refresh(@Req() req: any, @Res({ passthrough: true }) res: Response) {
    const token = req.cookies?.refresh_token;
    return this.authService.refresh(token, res);
  }

  // Google OAuth
  @Get('google')
  @UseGuards(GoogleAuthGuard)
  googleLogin() {}

  @Get('google/callback')
  @UseGuards(GoogleAuthGuard)
  async googleCallback(@Req() req, @Res() res: Response) {
    // `GoogleStrategy.validate` now returns the user entity.
    const user = req.user;

    // Issue refresh cookie and access token server-side (no token in URL)
    await this.authService.issueTokensForUser(user, res);

    const frontendUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/login.html`;

    const params = new URLSearchParams({
      welcome: 'true',
      username: user.username.split('@')[0] || user.username,
      role: user.role,
    });

    return res.redirect(`${frontendUrl}?${params.toString()}`);
  }

  @Get('me')
  @UseGuards(AuthGuard)
  me(@Req() req: any) {
    return this.authService.getAllMyData(req.user);
  }
}
