import { Module } from '@nestjs/common';
import { FilesController } from './files.controller';
import { FilesService } from './files.service';
import { ProjectsModule } from '../projects/projects.module';
import { ProjectMemberGuard } from '../projects/project-member.guard';

@Module({
  imports: [ProjectsModule],
  controllers: [FilesController],
  providers: [FilesService, ProjectMemberGuard],
})
export class FilesModule {}
