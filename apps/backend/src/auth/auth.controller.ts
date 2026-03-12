import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Role } from '@prisma/client';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { JwtUser } from '@df-portal/shared';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(@Body() _dto: LoginDto, @Req() req: any) {
    return this.authService.issueTokens(req.user);
  }

  @Post('register')
  async register(@Body() dto: RegisterDto) {
    return this.authService.registerLocal({
      email: dto.email,
      password: dto.password,
      name: dto.name,
      role: (dto.role as Role) || Role.DEVELOPER,
      organizationCode: dto.organizationCode,
    });
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  me(@CurrentUser() user: JwtUser) {
    return user;
  }

  @Get('google')
  @UseGuards(AuthGuard('google'))
  async googleAuth() {
    return;
  }

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  async googleCallback(@Req() req: any) {
    return req.user;
  }

  @Get('github')
  @UseGuards(AuthGuard('github'))
  async githubAuth() {
    return;
  }

  @Get('github/callback')
  @UseGuards(AuthGuard('github'))
  async githubCallback(@Req() req: any) {
    return req.user;
  }

  @Get('discord')
  @UseGuards(AuthGuard('discord'))
  async discordAuth() {
    return;
  }

  @Get('discord/callback')
  @UseGuards(AuthGuard('discord'))
  async discordCallback(@Req() req: any) {
    return req.user;
  }
}
