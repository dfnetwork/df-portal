import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../common/prisma.service';
import { OrgRole, Provider, Role } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private config: ConfigService,
  ) {}

  async validateUser(email: string, password: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user || !user.passwordHash) return null;
    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) return null;
    return user;
  }

  async issueTokens(user: { id: string; email: string; role: Role }) {
    const jwtId = uuidv4();
    const payload = { sub: user.id, email: user.email, role: user.role, jti: jwtId };
    const accessToken = await this.jwt.signAsync(payload);
    const expiresIn = this.config.get<number>('JWT_EXPIRES_SECONDS') ?? 3600;
    const expiresAt = new Date(Date.now() + expiresIn * 1000);
    await this.prisma.session.create({
      data: { userId: user.id, jwtId, expiresAt },
    });
    return { accessToken, expiresAt };
  }

  async registerLocal(dto: {
    email: string;
    password: string;
    name: string;
    role?: Role;
    organizationCode?: string;
  }) {
    const existing = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (existing) throw new UnauthorizedException('User already exists');
    const passwordHash = await bcrypt.hash(dto.password, 10);
    let orgMembershipData = undefined;
    if (dto.organizationCode) {
      const invite = await this.prisma.organizationInvite.findUnique({
        where: { code: dto.organizationCode },
        include: { organization: true },
      });

      if (
        invite &&
        (!invite.expiresAt || invite.expiresAt >= new Date()) &&
        (!invite.maxUses || invite.uses < invite.maxUses)
      ) {
        orgMembershipData = {
          organization: { connect: { id: invite.organizationId } },
          role: OrgRole.DEV_FULLSTACK,
        };
        await this.prisma.organizationInvite.update({
          where: { id: invite.id },
          data: { uses: { increment: 1 } },
        });
      } else {
        // fallback: allow direct org code match
        const org = await this.prisma.organization.findUnique({
          where: { code: dto.organizationCode },
        });
        if (!org) {
          throw new UnauthorizedException('Invalid organization code');
        }
        orgMembershipData = {
          organization: { connect: { id: org.id } },
          role: OrgRole.DEV_FULLSTACK,
        };
      }
    }

    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        name: dto.name,
        passwordHash,
        role: dto.role || Role.DEVELOPER,
        authProviders: {
          create: { provider: Provider.EMAIL, providerId: dto.email },
        },
        orgMemberships: orgMembershipData ? { create: orgMembershipData } : undefined,
      },
    });
    return this.issueTokens(user);
  }

  async oauthLogin(provider: Provider, profile: { id: string; email?: string; name?: string }) {
    const providerId = profile.id;
    const existingProvider = await this.prisma.authProvider.findUnique({
      where: { provider_providerId: { provider, providerId } },
      include: { user: true },
    });
    if (existingProvider) {
      return this.issueTokens(existingProvider.user);
    }

    if (!profile.email) {
      throw new UnauthorizedException('Email required from provider');
    }

    let user = await this.prisma.user.findUnique({ where: { email: profile.email } });
    if (!user) {
      user = await this.prisma.user.create({
        data: {
          email: profile.email,
          name: profile.name || profile.email.split('@')[0],
          role: Role.DEVELOPER,
          authProviders: { create: { provider, providerId } },
        },
      });
    } else {
      await this.prisma.authProvider.create({
        data: { provider, providerId, userId: user.id },
      });
    }
    return this.issueTokens(user);
  }
}
