import {
  Controller,
  Get,
  Post,
  Patch,
  Put,
  Req,
  Res,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
  ForbiddenException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Response } from 'express';
import { Public } from './decorators/public.decorator';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiBody } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { UpdateAccountDto } from './dto/update-account.dto';
import { UpdatePreferencesDto } from './dto/update-preferences.dto';
import { PreferencesResponseDto } from './dto/preferences-response.dto';
import { SessionResponseDto } from './dto/session-response.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Public()
  @Post('dev-login')
  @ApiOperation({ summary: 'Development login bypass (dev only)' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        email: {
          type: 'string',
          format: 'email',
          example: 'test@example.com',
        },
      },
      required: ['email'],
    },
  })
  async devLogin(@Body() body: { email: string }) {
    if (process.env.NODE_ENV === 'production') {
      throw new ForbiddenException('Dev login not available in production');
    }
    return this.authService.devLogin(body.email);
  }

  @Public()
  @Get('google')
  @ApiOperation({ summary: 'Initiate Google OAuth login' })
  @UseGuards(AuthGuard('google'))
  async googleAuth() {
    // Initiates Google OAuth flow
  }

  @Public()
  @Get('google/callback')
  @ApiOperation({ summary: 'Google OAuth callback' })
  @UseGuards(AuthGuard('google'))
  async googleAuthCallback(@Req() req: any, @Res() res: Response) {
    // User info is in req.user (set by GoogleStrategy)
    const { token } = req.user;

    // Redirect to frontend with token
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3001';
    res.redirect(`${frontendUrl}/auth/callback?token=${token}`);
  }

  @Get('profile')
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiBearerAuth()
  async getProfile(@Req() req: any) {
    return req.user;
  }

  @Patch('profile')
  @ApiOperation({ summary: 'Update user profile' })
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  async updateProfile(@Req() req: any, @Body() updateDto: UpdateProfileDto) {
    return this.authService.updateProfile(req.user.userId || req.user.id, updateDto);
  }

  @Patch('account')
  @ApiOperation({ summary: 'Update account settings (OWNER only)' })
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  async updateAccount(@Req() req: any, @Body() updateDto: UpdateAccountDto) {
    const userId = req.user.userId || req.user.id;
    const accountId = req.user.accountId;
    return this.authService.updateAccount(userId, accountId, updateDto);
  }

  @Get('preferences')
  @ApiOperation({ summary: 'Get user preferences' })
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  async getPreferences(@Req() req: any): Promise<PreferencesResponseDto> {
    return this.authService.getPreferences(req.user.userId || req.user.id);
  }

  @Put('preferences')
  @ApiOperation({ summary: 'Update user preferences' })
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  async updatePreferences(@Req() req: any, @Body() updateDto: UpdatePreferencesDto): Promise<PreferencesResponseDto> {
    return this.authService.updatePreferences(req.user.userId || req.user.id, updateDto);
  }

  @Get('sessions')
  @ApiOperation({ summary: 'Get active sessions' })
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  async getSessions(@Req() req: any): Promise<SessionResponseDto[]> {
    const token = req.headers.authorization?.replace('Bearer ', '');
    return this.authService.getSessions(req.user.userId || req.user.id, token || '');
  }

  @Post('logout-all')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Logout from all devices except current' })
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  async logoutAll(@Req() req: any) {
    const token = req.headers.authorization?.replace('Bearer ', '');
    return this.authService.logoutAll(req.user.userId || req.user.id, token || '');
  }
}
