import {
  Injectable,
  ForbiddenException,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { User, UserRole } from '@prisma/client';

interface ValidateOrCreateUserInput {
  googleId: string;
  email: string;
  name?: string;
  picture?: string;
}

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async validateOrCreateUser(input: ValidateOrCreateUserInput): Promise<User> {
    const { googleId, email, name, picture } = input;

    // Check if any users exist (first user becomes ADMIN)
    const userCount = await this.prisma.user.count();

    // Try to find by googleId first, then by email
    let user = await this.prisma.user.findFirst({
      where: { OR: [{ googleId }, { email }] },
    });

    if (!user) {
      // New user - check if first user (auto-ADMIN) or needs whitelist
      if (userCount === 0) {
        // First user ever - create as ADMIN
        user = await this.prisma.user.create({
          data: {
            email,
            googleId,
            name,
            picture,
            role: UserRole.ADMIN,
            isActive: true,
            lastLoginAt: new Date(),
          },
        });
        return user;
      }

      // Not first user - check if email is pre-approved in whitelist
      const whitelistEntry = await this.prisma.user.findUnique({
        where: { email },
      });

      if (!whitelistEntry) {
        throw new ForbiddenException(
          'האימייל שלך אינו מורשה לגשת למערכת. צור קשר עם המנהל כדי לקבל גישה.',
        );
      }

      if (!whitelistEntry.isActive) {
        throw new ForbiddenException('הגישה שלך הושעתה. צור קשר עם המנהל.');
      }

      // Update with Google info on first OAuth login
      user = await this.prisma.user.update({
        where: { email },
        data: {
          googleId,
          name: name || whitelistEntry.name,
          picture,
          lastLoginAt: new Date(),
        },
      });
      return user;
    }

    // Existing user - check if active
    if (!user.isActive) {
      throw new ForbiddenException('הגישה שלך הושעתה. צור קשר עם המנהל.');
    }

    // Update last login and profile info
    user = await this.prisma.user.update({
      where: { id: user.id },
      data: {
        googleId: googleId || user.googleId,
        name: name || user.name,
        picture: picture || user.picture,
        lastLoginAt: new Date(),
      },
    });

    return user;
  }

  async findById(id: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { id } });
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { email } });
  }

  async findAll(): Promise<User[]> {
    return this.prisma.user.findMany({
      orderBy: [{ role: 'asc' }, { createdAt: 'asc' }],
    });
  }

  async addToWhitelist(email: string, role: UserRole = UserRole.MEMBER): Promise<User> {
    const existing = await this.prisma.user.findUnique({ where: { email } });
    if (existing) {
      throw new ConflictException('כתובת האימייל כבר קיימת ברשימת המורשים');
    }
    return this.prisma.user.create({
      data: { email, role, isActive: true },
    });
  }

  async setActive(id: string, isActive: boolean): Promise<User> {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) {
      throw new NotFoundException('משתמש לא נמצא');
    }
    return this.prisma.user.update({ where: { id }, data: { isActive } });
  }

  async updateRole(id: string, role: UserRole): Promise<User> {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) {
      throw new NotFoundException('משתמש לא נמצא');
    }
    return this.prisma.user.update({ where: { id }, data: { role } });
  }

  async remove(id: string): Promise<void> {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) {
      throw new NotFoundException('משתמש לא נמצא');
    }
    await this.prisma.user.delete({ where: { id } });
  }
}
