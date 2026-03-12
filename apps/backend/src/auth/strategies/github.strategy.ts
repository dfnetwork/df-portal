import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, Profile } from 'passport-github2';
import { AuthService } from '../auth.service';
import { ConfigService } from '@nestjs/config';
import { Provider } from '@prisma/client';

@Injectable()
export class GithubStrategy extends PassportStrategy(Strategy, 'github') {
  constructor(authService: AuthService, config: ConfigService) {
    super({
      clientID: config.get<string>('GITHUB_CLIENT_ID'),
      clientSecret: config.get<string>('GITHUB_CLIENT_SECRET'),
      callbackURL: `${config.get<string>('OAUTH_CALLBACK_URL')}/github`,
      scope: ['user:email'],
    });
    this.authService = authService;
  }
  private authService: AuthService;

  async validate(
    _accessToken: string,
    _refreshToken: string,
    profile: any,
  ) {
    const email = profile.emails?.[0]?.value;
    return this.authService.oauthLogin(Provider.GITHUB, {
      id: profile.id,
      email,
      name: profile.username,
    });
  }
}
