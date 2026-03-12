import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { Role } from '@prisma/client';
import { JwtUser } from '@df-portal/shared';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ProjectsService } from './projects.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { AddMemberDto } from './dto/add-member.dto';

@Controller('projects')
@UseGuards(JwtAuthGuard)
export class ProjectsController {
  constructor(private projects: ProjectsService) {}

  @Get()
  list(@CurrentUser() user: JwtUser) {
    return this.projects.listForUser(user.sub, user.role as Role);
  }

  @Get(':projectId')
  async get(
    @Param('projectId') projectId: string,
    @CurrentUser() user: JwtUser,
  ) {
    return this.projects.find(projectId, user.sub, user.role as Role);
  }

  @Roles(Role.ADMIN)
  @UseGuards(RolesGuard)
  @Post()
  create(@Body() dto: CreateProjectDto, @CurrentUser() user: JwtUser) {
    return this.projects.create({
      name: dto.name,
      description: dto.description,
      ownerId: user.sub,
      userRole: user.role as Role,
      organizationId: dto.organizationId,
    });
  }

  @Roles(Role.ADMIN)
  @UseGuards(RolesGuard)
  @Patch(':projectId')
  update(@Param('projectId') projectId: string, @Body() dto: UpdateProjectDto) {
    return this.projects.update(projectId, dto);
  }

  @Roles(Role.ADMIN)
  @UseGuards(RolesGuard)
  @Delete(':projectId')
  remove(@Param('projectId') projectId: string) {
    return this.projects.delete(projectId);
  }

  @Roles(Role.ADMIN)
  @UseGuards(RolesGuard)
  @Post(':projectId/members')
  addMember(@Param('projectId') projectId: string, @Body() dto: AddMemberDto) {
    return this.projects.addMember(projectId, dto.userId, dto.role as Role);
  }

  @Roles(Role.ADMIN)
  @UseGuards(RolesGuard)
  @Delete(':projectId/members/:userId')
  removeMember(
    @Param('projectId') projectId: string,
    @Param('userId') userId: string,
  ) {
    return this.projects.removeMember(projectId, userId);
  }
}
