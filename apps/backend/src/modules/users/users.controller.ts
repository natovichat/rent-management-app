import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
  Req,
  ForbiddenException,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

class AddUserDto {
  email: string;
  role?: UserRole;
}

class UpdateUserDto {
  isActive?: boolean;
  role?: UserRole;
}

function requireAdmin(user: any) {
  if (!user || user.role !== UserRole.ADMIN) {
    throw new ForbiddenException('פעולה זו מותרת למנהלים בלבד');
  }
}

@ApiTags('users')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @ApiOperation({ summary: 'List all users (admin only)' })
  async findAll(@Req() req: any) {
    requireAdmin(req.user);
    const users = await this.usersService.findAll();
    return users.map((u) => ({
      id: u.id,
      email: u.email,
      name: u.name,
      picture: u.picture,
      role: u.role,
      isActive: u.isActive,
      lastLoginAt: u.lastLoginAt,
      createdAt: u.createdAt,
    }));
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Add email to whitelist (admin only)' })
  async addUser(@Req() req: any, @Body() dto: AddUserDto) {
    requireAdmin(req.user);
    const user = await this.usersService.addToWhitelist(
      dto.email,
      dto.role || UserRole.MEMBER,
    );
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      isActive: user.isActive,
      createdAt: user.createdAt,
    };
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update user role or active status (admin only)' })
  async updateUser(
    @Req() req: any,
    @Param('id') id: string,
    @Body() dto: UpdateUserDto,
  ) {
    requireAdmin(req.user);
    let user = await this.usersService.findById(id);
    if (!user) throw new ForbiddenException('משתמש לא נמצא');

    if (dto.isActive !== undefined) {
      user = await this.usersService.setActive(id, dto.isActive);
    }
    if (dto.role !== undefined) {
      user = await this.usersService.updateRole(id, dto.role);
    }

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      isActive: user.isActive,
    };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remove user from whitelist (admin only)' })
  async removeUser(@Req() req: any, @Param('id') id: string) {
    requireAdmin(req.user);
    // Prevent admin from deleting themselves
    if (req.user.id === id) {
      throw new ForbiddenException('לא ניתן למחוק את החשבון שלך');
    }
    await this.usersService.remove(id);
  }
}
