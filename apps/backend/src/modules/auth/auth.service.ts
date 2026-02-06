import { Injectable, ForbiddenException, NotFoundException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../database/prisma.service';
import { JwtPayload } from './strategies/jwt.strategy';
import { User, Account, UserRole } from '@prisma/client';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { UpdateAccountDto } from './dto/update-account.dto';
import { UpdatePreferencesDto } from './dto/update-preferences.dto';

interface OAuthUser {
  googleId: string;
  email: string;
  firstName: string;
  lastName: string;
  picture?: string;
}

type UserWithAccount = User & {
  account: Account;
};

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async validateOAuthLogin(oauthUser: OAuthUser) {
    // Check if user exists
    let user = await this.prisma.user.findUnique({
      where: { googleId: oauthUser.googleId },
      include: { account: true },
    });

    if (!user) {
      // Create new user with new account
      user = await this.createUserWithAccount(oauthUser);
    } else {
      // Update last login
      await this.prisma.user.update({
        where: { id: user.id },
        data: { lastLoginAt: new Date() },
      });
    }

    // Generate JWT token
    const token = await this.generateToken(user);

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        accountId: user.accountId,
      },
      token,
    };
  }

  private async createUserWithAccount(oauthUser: OAuthUser) {
    // Create account and user in transaction
    const result = await this.prisma.$transaction(async (tx) => {
      // Create account
      const account = await tx.account.create({
        data: {
          name: `${oauthUser.firstName}'s Account`,
          status: 'ACTIVE',
        },
      });

      // Create user
      const user = await tx.user.create({
        data: {
          accountId: account.id,
          email: oauthUser.email,
          name: `${oauthUser.firstName} ${oauthUser.lastName}`,
          googleId: oauthUser.googleId,
          role: 'OWNER', // First user is owner
          lastLoginAt: new Date(),
        },
        include: { account: true },
      });

      return user;
    });

    return result;
  }

  private async generateToken(user: UserWithAccount): Promise<string> {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      accountId: user.accountId,
      role: user.role,
    };

    return this.jwtService.sign(payload);
  }

  async refreshToken(userId: string): Promise<string> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { account: true },
    });

    if (!user) {
      throw new Error('User not found');
    }

    return this.generateToken(user);
  }

  async devLogin(email: string) {
    // Check if user exists by email
    let user = await this.prisma.user.findFirst({
      where: { email },
      include: { account: true },
    });

    if (!user) {
      // Create new user with new account
      user = await this.createDevUserWithAccount(email);
    } else {
      // Update last login
      await this.prisma.user.update({
        where: { id: user.id },
        data: { lastLoginAt: new Date() },
      });
    }

    // Generate JWT token
    const token = await this.generateToken(user);

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        accountId: user.accountId,
      },
      token,
    };
  }

  private async createDevUserWithAccount(email: string) {
    // Extract name from email (before @) for dev accounts
    const emailName = email.split('@')[0];
    const displayName = emailName
      .split(/[._-]/)
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(' ');

    // Create account and user in transaction
    const result = await this.prisma.$transaction(async (tx) => {
      // Create account
      const account = await tx.account.create({
        data: {
          name: `${displayName}'s Account`,
          status: 'ACTIVE',
        },
      });

      // Create user
      const user = await tx.user.create({
        data: {
          accountId: account.id,
          email,
          name: displayName,
          googleId: `dev-${email}`, // Dev accounts use email as googleId prefix
          role: 'OWNER', // First user is owner
          lastLoginAt: new Date(),
        },
        include: { account: true },
      });

      return user;
    });

    return result;
  }

  async updateProfile(userId: string, updateDto: UpdateProfileDto) {
    const trimmedName = updateDto.name.trim();
    if (!trimmedName || trimmedName.length === 0) {
      throw new BadRequestException('Name cannot be empty or only whitespace');
    }

    const user = await this.prisma.user.update({
      where: { id: userId },
      data: {
        name: trimmedName,
      },
      include: {
        account: true,
      },
    });

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      accountId: user.accountId,
      account: {
        id: user.account.id,
        name: user.account.name,
        status: user.account.status,
      },
    };
  }

  async updateAccount(userId: string, accountId: string, updateDto: UpdateAccountDto) {
    // Check if user is OWNER
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user || user.role !== UserRole.OWNER) {
      throw new ForbiddenException('Only account owners can update account settings');
    }

    const account = await this.prisma.account.update({
      where: { id: accountId },
      data: {
        name: updateDto.name.trim(),
      },
    });

    return account;
  }

  async getPreferences(userId: string) {
    const preferences = await this.prisma.userPreferences.findUnique({
      where: { userId },
    });

    if (!preferences) {
      // Return defaults
      return {
        language: 'he',
        dateFormat: 'DD/MM/YYYY',
        currency: 'ILS',
        theme: 'light',
      };
    }

    return {
      language: preferences.language,
      dateFormat: preferences.dateFormat,
      currency: preferences.currency,
      theme: preferences.theme,
    };
  }

  async updatePreferences(userId: string, updateDto: UpdatePreferencesDto) {
    const preferences = await this.prisma.userPreferences.upsert({
      where: { userId },
      update: {
        language: updateDto.language,
        dateFormat: updateDto.dateFormat,
        currency: updateDto.currency,
        theme: updateDto.theme,
      },
      create: {
        userId,
        language: updateDto.language || 'he',
        dateFormat: updateDto.dateFormat || 'DD/MM/YYYY',
        currency: updateDto.currency || 'ILS',
        theme: updateDto.theme || 'light',
      },
    });

    return {
      language: preferences.language,
      dateFormat: preferences.dateFormat,
      currency: preferences.currency,
      theme: preferences.theme,
    };
  }

  async getSessions(userId: string, currentToken: string) {
    const sessions = await this.prisma.session.findMany({
      where: { userId },
      orderBy: { lastActivity: 'desc' },
    });

    return sessions.map((session) => ({
      id: session.id,
      device: session.device,
      ipAddress: session.ipAddress,
      lastActivity: session.lastActivity,
      createdAt: session.createdAt,
      isCurrent: session.token === currentToken,
    }));
  }

  async logoutAll(userId: string, currentToken: string) {
    // Delete all sessions except current
    await this.prisma.session.deleteMany({
      where: {
        userId,
        token: {
          not: currentToken,
        },
      },
    });

    return { success: true };
  }
}
