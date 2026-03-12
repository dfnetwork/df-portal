import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, Profile } from 'passport-google-oauth20';
import { AuthService } from '../auth.service';
import { ConfigService } from '@nestjs/config';
import { Provider } from '@prisma/client';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(authService: AuthService, config: ConfigService) {
    super({
      clientID: config.get<string>('GOOGLE_CLIENT_ID'),
      clientSecret: config.get<string>('GOOGLE_CLIENT_SECRET'),
      callbackURL: `${config.get<string>('OAUTH_CALLBACK_URL')}/google`,
      scope: ['email', 'profile'],
      passReqToCallback: false,
    });
    this.authService = authService;
  }
  private authService: AuthService;

  async validate(_accessToken: string, _refreshToken: string, profile: Profile) {
    const email = profile.emails?.[0]?.value;
    return this.authService.oauthLogin(Provider.GOOGLE, {
      id: profile.id,
      email,
      name: profile.displayName,
    });
  }
}
