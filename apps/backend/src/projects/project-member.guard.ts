import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { Role } from '@prisma/client';

@Injectable()
export class ProjectMemberGuard implements CanActivate {
  constructor(private prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();
    const user = req.user;
    const projectId = req.params.projectId;
    if (!user || !projectId) throw new ForbiddenException();
    if ([Role.ADMIN, Role.OWNER, Role.STAFF, Role.MOD, Role.SUPPORT].includes(user.role))
      return true;
    const membership = await this.prisma.projectMember.findUnique({
      where: { projectId_userId: { projectId, userId: user.sub } },
    });
    if (!membership) throw new ForbiddenException();
    return true;
  }
}
