import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../../users/users.service';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(
    private readonly configService: ConfigService,
    private readonly usersService: UsersService,
  ) {
    super({
      clientID: configService.get<string>('google.clientID'),
      clientSecret: configService.get<string>('google.clientSecret'),
      callbackURL: configService.get<string>('google.callbackURL'),
      scope: ['email', 'profile'],
    });
  }

  async validate(
    _accessToken: string,
    _refreshToken: string,
    profile: any,
    done: VerifyCallback,
  ): Promise<any> {
    const { id: googleId, displayName: name, emails, photos } = profile;
    const email = emails?.[0]?.value;
    const picture = photos?.[0]?.value;

    if (!email) {
      return done(new UnauthorizedException('לא ניתן לקבל כתובת אימייל מ-Google'), false);
    }

    const user = await this.usersService.validateOrCreateUser({
      googleId,
      email,
      name,
      picture,
    });

    return done(null, user);
  }
}
