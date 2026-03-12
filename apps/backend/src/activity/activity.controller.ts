import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { JwtUser } from '@df-portal/shared';
import { ActivityService } from './activity.service';
import { Role } from '@prisma/client';

@Controller('activity')
@UseGuards(JwtAuthGuard)
export class ActivityController {
  constructor(private activity: ActivityService) {}

  @Get()
  list(@CurrentUser() user: JwtUser, @Query('projectId') projectId?: string) {
    return this.activity.list(user.sub, user.role as Role, projectId);
  }
}
