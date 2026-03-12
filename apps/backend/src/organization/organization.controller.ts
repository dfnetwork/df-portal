import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { OrganizationService } from './organization.service';
import { CreateOrganizationDto } from './dto/create-organization.dto';
import { CreateInviteDto } from './dto/create-invite.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { JwtUser } from '@df-portal/shared';

@Controller('organizations')
@UseGuards(JwtAuthGuard, RolesGuard)
export class OrganizationController {
  constructor(private orgs: OrganizationService) {}

  @Post()
  @Roles(Role.ADMIN)
  create(@Body() dto: CreateOrganizationDto, @CurrentUser() user: JwtUser) {
    return this.orgs.create(dto.name, dto.code, user.sub, user.role as Role);
  }

  @Get()
  list(@CurrentUser() user: JwtUser) {
    return this.orgs.listForUser(user.sub, user.role as Role);
  }

  @Post(':id/invites')
  createInvite(
    @Param('id') id: string,
    @Body() dto: CreateInviteDto,
    @CurrentUser() user: JwtUser,
  ) {
    return this.orgs.createInvite(
      id,
      user.sub,
      user.role as Role,
      {
        expiresAt: dto.expiresAt ? new Date(dto.expiresAt) : undefined,
        maxUses: dto.maxUses,
      },
    );
  }
}
