import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-discord';
import { AuthService } from '../auth.service';
import { ConfigService } from '@nestjs/config';
import { Provider } from '@prisma/client';

@Injectable()
export class DiscordStrategy extends PassportStrategy(Strategy, 'discord') {
  constructor(authService: AuthService, config: ConfigService) {
    super({
      clientID: config.get<string>('DISCORD_CLIENT_ID'),
      clientSecret: config.get<string>('DISCORD_CLIENT_SECRET'),
      callbackURL: `${config.get<string>('OAUTH_CALLBACK_URL')}/discord`,
      scope: ['identify', 'email'],
    });
    this.authService = authService;
  }
  private authService: AuthService;

  async validate(
    _accessToken: string,
    _refreshToken: string,
    profile: any,
  ) {
    const email = profile.email;
    return this.authService.oauthLogin(Provider.DISCORD, {
      id: profile.id,
      email,
      name: profile.username,
    });
  }
}
