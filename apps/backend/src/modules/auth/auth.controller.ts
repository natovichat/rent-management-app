import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Req,
  Res,
  UseGuards,
  HttpCode,
  HttpStatus,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { Response } from 'express';
import { AuthService } from './auth.service';
import { Public } from './decorators/public.decorator';
import { ConfigService } from '@nestjs/config';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { UsersService } from '../users/users.service';

class UpdateProfileDto {
  name: string;
}

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
    private readonly usersService: UsersService,
  ) {}

  @Public()
  @Get('google')
  @UseGuards(AuthGuard('google'))
  @ApiOperation({ summary: 'Redirect to Google OAuth' })
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  googleAuth(@Req() _req: any) {
    // Passport handles the redirect
  }

  @Public()
  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  @ApiOperation({ summary: 'Handle Google OAuth callback' })
  googleAuthCallback(@Req() req: any, @Res() res: Response) {
    const frontendUrl =
      this.configService.get<string>('frontendUrl') || 'http://localhost:3001';

    try {
      const user = req.user;
      if (!user) {
        return res.redirect(`${frontendUrl}/auth/error?reason=unauthorized`);
      }

      const token = this.authService.generateJwt(user);
      return res.redirect(`${frontendUrl}/auth/callback?token=${token}`);
    } catch {
      return res.redirect(`${frontendUrl}/auth/error?reason=server_error`);
    }
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get current user profile' })
  getProfile(@Req() req: any) {
    return this.authService.getUserProfile(req.user);
  }

  @Patch('profile')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update current user display name' })
  async updateProfile(@Req() req: any, @Body() dto: UpdateProfileDto) {
    const updated = await this.usersService.updateName(req.user.id, dto.name);
    return this.authService.getUserProfile(updated);
  }

  @Get('sessions')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get active sessions (JWT-based: returns current session only)' })
  getSessions(@Req() req: any) {
    // JWT is stateless — we return the current session derived from the token
    const user = req.user;
    return [
      {
        id: user.sub || user.id,
        device: req.headers['user-agent'] || 'מכשיר לא ידוע',
        ipAddress: req.ip || null,
        lastActivity: new Date(),
        createdAt: new Date(),
        isCurrent: true,
      },
    ];
  }

  @Post('logout-all')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Logout from all devices (client-side token removal)' })
  logoutAll() {
    // JWT tokens are stateless — true invalidation requires a token blacklist.
    // The client removes its own token; other sessions expire naturally.
    return { success: true };
  }

  @Public()
  @Get('health')
  @HttpCode(HttpStatus.OK)
  health() {
    return { status: 'ok' };
  }
}
