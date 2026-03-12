import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { Role } from '@prisma/client';

@Injectable()
export class ProjectsService {
  constructor(private prisma: PrismaService) {}

  private isElevated(role: Role) {
    const elevated: Role[] = [
      Role.ADMIN,
      Role.OWNER,
      Role.STAFF,
      Role.MOD,
      Role.SUPPORT,
    ];
    return elevated.includes(role);
  }

  async listForUser(userId: string, role: Role) {
    if (this.isElevated(role)) {
      return this.prisma.project.findMany({ orderBy: { createdAt: 'desc' } });
    }
    return this.prisma.project.findMany({
      where: {
        organization: { members: { some: { userId } } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async find(projectId: string, userId: string, role: Role) {
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
      include: { members: true, organization: { include: { members: true } } },
    });
    if (!project) throw new NotFoundException('Project not found');
    if (!this.isElevated(role)) {
      const inOrg = project.organization.members.some((m) => m.userId === userId);
      const inProject = project.members.some((m) => m.userId === userId);
      if (!inOrg && !inProject) throw new ForbiddenException();
    }
    return project;
  }

  async create(data: {
    name: string;
    description?: string;
    ownerId: string;
    organizationId: string;
    userRole: Role;
  }) {
    const org = await this.prisma.organization.findUnique({
      where: { id: data.organizationId },
      include: { members: { where: { userId: data.ownerId } } },
    });
    if (!org) throw new NotFoundException('Organization not found');
    if (!org.members.length && !this.isElevated(data.userRole)) {
      throw new ForbiddenException('User not in organization');
    }

    return this.prisma.project.create({
      data: {
        name: data.name,
        description: data.description,
        organizationId: data.organizationId,
        members: {
          create: [{ userId: data.ownerId, role: Role.ADMIN }],
        },
        folders: {
          create: [{ name: 'root' }],
        },
      },
    });
  }

  async update(projectId: string, data: { name?: string; description?: string }) {
    return this.prisma.project.update({ where: { id: projectId }, data });
  }

  async delete(projectId: string) {
    await this.prisma.project.delete({ where: { id: projectId } });
    return { success: true };
  }

  async addMember(projectId: string, userId: string, role: Role) {
    return this.prisma.projectMember.upsert({
      where: { projectId_userId: { projectId, userId } },
      update: { role },
      create: { projectId, userId, role },
    });
  }

  async removeMember(projectId: string, userId: string) {
    return this.prisma.projectMember.delete({
      where: { projectId_userId: { projectId, userId } },
    });
  }
}
