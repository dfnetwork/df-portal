import { Injectable } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { Role } from '@prisma/client';

@Injectable()
export class ActivityService {
  constructor(private prisma: PrismaService) {}

  async log(data: {
    userId?: string;
    projectId?: string;
    action: string;
    metadata?: any;
  }) {
    return this.prisma.activityLog.create({ data });
  }

  async list(userId: string, role: Role, projectId?: string) {
    const where: any = {};
    if (role !== Role.ADMIN) {
      where.projectId = projectId || undefined;
      where.userId = userId;
    } else if (projectId) {
      where.projectId = projectId;
    }
    return this.prisma.activityLog.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: 200,
    });
  }
}
