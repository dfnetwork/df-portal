import {
  CanActivate,
  ExecutionContext,
  Injectable,
  ForbiddenException,
} from '@nestjs/common';
  import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { Role } from '@prisma/client';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles =
      this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
        context.getHandler(),
        context.getClass(),
      ]) || [];
    if (!requiredRoles.length) return true;
    const { user } = context.switchToHttp().getRequest();
    const elevatedAdmin = [Role.ADMIN, Role.OWNER, Role.STAFF, Role.MOD, Role.SUPPORT];
    const passes =
      user &&
      (requiredRoles.includes(user.role) ||
        (requiredRoles.includes(Role.ADMIN) && elevatedAdmin.includes(user.role)));

    if (!passes) {
      throw new ForbiddenException('Insufficient role');
    }
    return true;
  }
}
