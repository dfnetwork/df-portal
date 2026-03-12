import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { OrgRole, Role } from '@prisma/client';

@Injectable()
export class OrganizationService {
  constructor(private prisma: PrismaService) {}

  private isGlobalAdmin(role: Role) {
    return [Role.OWNER, Role.STAFF, Role.MOD, Role.SUPPORT, Role.ADMIN].includes(role);
  }

  async create(name: string, code: string, userId: string, role: Role) {
    if (!this.isGlobalAdmin(role)) {
      throw new ForbiddenException();
    }
    return this.prisma.organization.create({
      data: {
        name,
        code,
        members: {
          create: { userId, role: OrgRole.ADMIN },
        },
      },
    });
  }

  async listForUser(userId: string, role: Role) {
    if (this.isGlobalAdmin(role)) {
      return this.prisma.organization.findMany();
    }
    return this.prisma.organization.findMany({
      where: { members: { some: { userId } } },
    });
  }

  async createInvite(organizationId: string, userId: string, role: Role, data: { expiresAt?: Date; maxUses?: number }) {
    const org = await this.prisma.organization.findUnique({
      where: { id: organizationId },
      include: { members: { where: { userId } } },
    });
    if (!org) throw new NotFoundException('Organization not found');
    if (!org.members.length && !this.isGlobalAdmin(role)) {
      throw new ForbiddenException();
    }
    const code = Math.random().toString(36).substring(2, 8).toUpperCase();
    return this.prisma.organizationInvite.create({
      data: {
        code,
        organizationId,
        expiresAt: data.expiresAt,
        maxUses: data.maxUses,
      },
    });
  }
}
